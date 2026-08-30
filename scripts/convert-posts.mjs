import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse, serialize, serializeOuter } from "parse5";

const root = process.cwd();
const postsRoot = path.join(root, "posts");
const legacyRoot = path.resolve(process.argv[2] ?? "");

if (!process.argv[2]) {
  throw new Error("Usage: node scripts/convert-posts.mjs /path/to/legacy-export");
}

const monthNumbers = new Map([
  ["January", "01"], ["February", "02"], ["March", "03"], ["April", "04"],
  ["May", "05"], ["June", "06"], ["July", "07"], ["August", "08"],
  ["September", "09"], ["October", "10"], ["November", "11"], ["December", "12"],
]);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function elementsBelow(node, predicate, result = []) {
  if (node.tagName && predicate(node)) result.push(node);
  for (const child of node.childNodes ?? []) elementsBelow(child, predicate, result);
  return result;
}

function attribute(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value;
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value;
  return (node.childNodes ?? []).map(textContent).join("");
}

function parseLegacyPage(html) {
  const document = parse(html);
  const article = elementsBelow(document, (node) => node.tagName === "article")[0];
  if (!article) throw new Error("Legacy page does not contain an article element");
  const highlightedCode = elementsBelow(
    article,
    (node) => node.tagName === "code" && (attribute(node, "class") ?? "").split(/\s+/).includes("highlight"),
  ).map((node) => serializeOuter(node));
  return { document, article, highlightedCode };
}

function parseHeadersAndBody(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const headers = {};
  let index = 0;
  while (index < lines.length && lines[index].trim() !== "") {
    const separator = lines[index].indexOf(":");
    if (separator === -1) throw new Error(`Invalid legacy header: ${lines[index]}`);
    headers[lines[index].slice(0, separator)] = lines[index].slice(separator + 1).trimStart();
    index += 1;
  }
  return { headers, body: lines.slice(index + 1).join("\n") };
}

function isoDate(value) {
  const match = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(value);
  if (!match) throw new Error(`Invalid legacy date: ${value}`);
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function dateFromByline(value) {
  const match = /published ([A-Z][a-z]+) (\d{2}), (\d{4})/.exec(value);
  if (!match || !monthNumbers.has(match[1])) throw new Error(`Invalid legacy byline: ${value}`);
  return `${match[3]}-${monthNumbers.get(match[1])}-${match[2]}`;
}

function yamlLine(key, value) {
  if (typeof value === "number" || typeof value === "boolean") return `${key}: ${value}`;
  return `${key}: ${JSON.stringify(value)}`;
}

function frontmatter(headers, archiveOrder, contentFormat) {
  const lines = [
    "---",
    yamlLine("title", headers.title),
    yamlLine("date", headers.date),
    yamlLine("content_format", contentFormat),
    yamlLine("archive_order", archiveOrder),
  ];
  for (const key of ["series", "updated", "rss_warning", "unlisted"]) {
    if (!(key in headers)) continue;
    const value = key === "rss_warning" || key === "unlisted" ? headers[key] === "true" : headers[key];
    lines.push(yamlLine(key, value));
  }
  lines.push("---", "");
  return lines.join("\n");
}

function routeForSource(file) {
  const relative = path.relative(postsRoot, file).replaceAll(path.sep, "/");
  return `/${relative.replace(/\.(?:html|md|docx)$/i, "")}/`;
}

function legacyPagePath(route) {
  return path.join(legacyRoot, route.slice(1), "index.html");
}

async function archiveOrderByRoute() {
  const home = parse(await readFile(path.join(legacyRoot, "index.html"), "utf8"));
  const routes = elementsBelow(home, (node) => node.tagName === "a")
    .map((node) => attribute(node, "href"))
    .filter((href) => href?.startsWith("/blog/") || href?.startsWith("/dump/"));
  return new Map(routes.map((route, index) => [route, index]));
}

const archiveOrder = await archiveOrderByRoute();
const sourceFiles = (await filesBelow(postsRoot))
  .filter((file) => /\.(?:html|md|docx)$/i.test(file))
  .sort();

for (const file of sourceFiles) {
  const route = routeForSource(file);
  const order = archiveOrder.get(route);
  if (order === undefined) throw new Error(`Route is missing from legacy archive: ${route}`);

  const legacyHtml = await readFile(legacyPagePath(route), "utf8");
  const legacy = parseLegacyPage(legacyHtml);
  let headers;
  let body;
  const contentFormat = file.endsWith(".md") ? "markdown" : "html";

  if (file.endsWith(".docx")) {
    const heading = elementsBelow(legacy.document, (node) => node.tagName === "h1")[0];
    const byline = elementsBelow(
      legacy.document,
      (node) => node.tagName === "p" && attribute(node, "class") === "timestamp",
    )[0];
    headers = {
      title: serialize(heading),
      date: dateFromByline(textContent(byline)),
    };
    body = serialize(legacy.article);
  } else {
    const source = await readFile(file, "utf8");
    const parsed = parseHeadersAndBody(source);
    headers = {
      ...parsed.headers,
      date: isoDate(parsed.headers.date),
      ...(parsed.headers.updated ? { updated: isoDate(parsed.headers.updated) } : {}),
    };

    let codeIndex = 0;
    body = parsed.body.replace(/<code(.*?)>\s*?(.*?)\s*?<\/code>/gms, () => {
      const highlighted = legacy.highlightedCode[codeIndex];
      codeIndex += 1;
      if (!highlighted) throw new Error(`Missing highlighted code ${codeIndex} for ${route}`);
      return highlighted;
    });
    if (codeIndex !== legacy.highlightedCode.length) {
      throw new Error(`Highlighted code count mismatch for ${route}: source=${codeIndex}, legacy=${legacy.highlightedCode.length}`);
    }
  }

  const target = file.replace(/\.(?:html|md|docx)$/i, ".md");
  await writeFile(target, `${frontmatter(headers, order, contentFormat)}${body.replace(/\s+$/, "")}\n`, "utf8");
  if (target !== file) await rm(file);
}

console.log(`Converted ${sourceFiles.length} posts to YAML-frontmatter Markdown.`);
