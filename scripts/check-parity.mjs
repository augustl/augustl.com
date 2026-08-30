import { execFile, spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const legacyRoot = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Usage: node scripts/check-parity.mjs /path/to/legacy-export");

const mimeTypes = {
  ".css": "text/css",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/atom+xml; charset=utf-8",
};

function legacyFileFor(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  if (pathname.includes("..")) return undefined;
  let candidate = path.join(legacyRoot, pathname);
  if (pathname.endsWith("/")) candidate = path.join(candidate, "index.html");
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return undefined;
  return candidate;
}

const legacyServer = createServer((request, response) => {
  const file = legacyFileFor(request.url ?? "/");
  if (!file) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.setHeader("Content-Type", mimeTypes[path.extname(file).toLowerCase()] ?? "application/octet-stream");
  createReadStream(file).pipe(response);
});

await new Promise((resolve) => legacyServer.listen(4173, "127.0.0.1", resolve));

const nextServer = spawn("mise", ["exec", "--", "yarn", "start", "--hostname", "127.0.0.1", "--port", "4174"], {
  cwd: process.cwd(),
  env: { ...process.env, PATH: `/home/augustl/.local/share/mise/installs/node/24.11.0/bin:/usr/bin:/bin` },
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForNext() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4174/");
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Next server did not become ready");
}

async function markdownFilesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await markdownFilesBelow(entryPath));
    else if (entry.name.endsWith(".md")) result.push(entryPath);
  }
  return result;
}

function postRoute(file) {
  return `/${path.relative(path.join(process.cwd(), "posts"), file).split(path.sep).join("/").replace(/\.md$/, "")}/`;
}

function comparableMarkup(element) {
  if (!element) return null;
  const whitespaceSensitive = new Set(["pre", "code", "script", "style", "textarea", "template"]);
  function mergeAdjacentText(nodes) {
    const merged = [];
    for (const node of nodes) {
      const previous = merged.at(-1);
      if (node.type === "text" && previous?.type === "text") previous.value += node.value;
      else merged.push(node);
    }
    return merged;
  }
  function canonical(node, preserveWhitespace = false) {
    if (node.nodeType === Node.COMMENT_NODE) return null;
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue ?? "";
      if (!preserveWhitespace && /^\s*$/.test(value)) return null;
      return { type: "text", value };
    }
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return null;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag === "script" && ((node.getAttribute("src") ?? "").startsWith("/_next/") || node.textContent?.includes("self.__next_f"))) {
        return null;
      }
      const attrs = [...node.attributes].map((attr) => [
        attr.name.toLowerCase(),
        attr.name.toLowerCase() === "style" ? node.style.cssText : attr.value,
      ]).sort(([left], [right]) => left.localeCompare(right));
      const childRoot = tag === "template" ? node.content : node;
      const rawChildren = [...childRoot.childNodes]
        .map((child) => canonical(child, preserveWhitespace || whitespaceSensitive.has(tag)))
        .filter(Boolean);
      const children = mergeAdjacentText(rawChildren);
      if (tag === "div" && node.hasAttribute("hidden") && children.length === 0) return null;
      return { type: "element", tag, attrs, children };
    }
    return [...node.childNodes].map((child) => canonical(child, preserveWhitespace)).filter(Boolean);
  }
  const root = element.tagName?.toLowerCase() === "template" ? element.content : element;
  return mergeAdjacentText([...root.childNodes].map((child) => canonical(child)).filter(Boolean));
}

function normalizedImageError(firstPath, secondPath) {
  return new Promise((resolve, reject) => {
    execFile("compare", ["-metric", "RMSE", firstPath, secondPath, "null:"], (error, _stdout, stderr) => {
      if (error && error.code !== 1) {
        reject(error);
        return;
      }
      const match = /\(([^)]+)\)/.exec(stderr);
      if (!match) {
        reject(new Error(`Could not parse ImageMagick output: ${stderr}`));
        return;
      }
      resolve(Number(match[1]));
    });
  });
}

await waitForNext();

const httpContracts = [
  ["/", 200],
  ["/blog/2023/blogging_with_word/", 200],
  ["/blog/2023/blogging_with_word", 308, "/blog/2023/blogging_with_word/"],
  ["/index.html", 404],
  ["/blog/2023/blogging_with_word/index.html", 404],
  ["/missing/", 404],
];

for (const [route, expectedStatus, expectedLocation] of httpContracts) {
  const response = await fetch(`http://127.0.0.1:4174${route}`, { redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${route} returned ${response.status}; expected ${expectedStatus}`);
  }
  if (expectedLocation && response.headers.get("location") !== expectedLocation) {
    throw new Error(`${route} redirected to ${response.headers.get("location")}; expected ${expectedLocation}`);
  }
}

const atomResponse = await fetch("http://127.0.0.1:4174/atom.xml");
if (!atomResponse.headers.get("content-type")?.startsWith("application/atom+xml")) {
  throw new Error(`/atom.xml returned unexpected Content-Type: ${atomResponse.headers.get("content-type")}`);
}

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
const context = await browser.newContext();
await context.route("**/*", async (route) => {
  const host = new URL(route.request().url()).hostname;
  if (host === "127.0.0.1") await route.continue();
  else await route.abort();
});

async function articleSnapshot(baseURL, route) {
  const page = await context.newPage();
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  if (!response?.ok()) throw new Error(`${baseURL}${route} returned ${response?.status()}`);
  const snapshot = await page.evaluate(({ comparableMarkupSource }) => {
    const clean = new Function(`return (${comparableMarkupSource})`)();
    const article = document.querySelector("article");
    const title = document.querySelector("#article > h1");
    const timestamp = document.querySelector("#article > .timestamp");
    const series = document.querySelector("#article > .series");
    return {
      article: clean(article),
      title: clean(title),
      timestamp: clean(timestamp),
      series: clean(series),
    };
  }, { comparableMarkupSource: comparableMarkup.toString() });
  await page.close();
  return snapshot;
}

async function elementSnapshot(baseURL, route, selector) {
  const page = await context.newPage();
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  if (!response?.ok()) throw new Error(`${baseURL}${route} returned ${response?.status()}`);
  const snapshot = await page.evaluate(
    ({ selector, comparableMarkupSource }) => {
      const clean = new Function(`return (${comparableMarkupSource})`)();
      return clean(document.querySelector(selector));
    },
    { selector, comparableMarkupSource: comparableMarkup.toString() },
  );
  await page.close();
  return snapshot;
}

async function feedSnapshot(baseURL, route) {
  const page = await context.newPage();
  const response = await fetch(`${baseURL}${route}`);
  const xml = await response.text();
  const snapshot = await page.evaluate(({ xml, comparableMarkupSource }) => {
    const clean = new Function(`return (${comparableMarkupSource})`)();
    const documentNode = new DOMParser().parseFromString(xml, "application/xml");
    const entries = [...documentNode.querySelectorAll("entry")].map((entry) => {
      const content = entry.querySelector("content")?.textContent ?? "";
      const template = document.createElement("template");
      template.innerHTML = content;
      return {
        title: entry.querySelector("title")?.textContent,
        updated: entry.querySelector("updated")?.textContent,
        author: entry.querySelector("author name")?.textContent,
        href: entry.querySelector("link")?.getAttribute("href"),
        id: entry.querySelector("id")?.textContent,
        content: clean(template),
      };
    });
    return {
      id: documentNode.querySelector("feed > id")?.textContent,
      updated: documentNode.querySelector("feed > updated")?.textContent,
      title: documentNode.querySelector("feed > title")?.textContent,
      self: documentNode.querySelector("feed > link")?.getAttribute("href"),
      entries,
    };
  }, { xml, comparableMarkupSource: comparableMarkup.toString() });
  await page.close();
  return snapshot;
}

const postRoutes = (await markdownFilesBelow(path.join(process.cwd(), "posts"))).map(postRoute).sort();
const failures = [];
if (process.env.PARITY_SCOPE !== "shell") {
  for (const route of postRoutes) {
    const legacy = await articleSnapshot("http://127.0.0.1:4173", route);
    const next = await articleSnapshot("http://127.0.0.1:4174", route);
    if (JSON.stringify(legacy) !== JSON.stringify(next)) {
      failures.push({ route, legacy, next });
      console.error(`DOM mismatch: ${route}`);
    }
  }
}

const pageContracts = [
  ["/", ".site-content-main"],
  ["/series/datomic/", ".site-content-main"],
  ["/series/advent_calendar_2019/", ".site-content-main"],
  ["/about/", "body"],
  ["/letconstvar/", "body"],
  ["/blog/2023/blogging_with_word/", ".site-content-main"],
  ["/blog/2019/amazing_lazy_data_structures/", ".site-content-main"],
];

for (const [route, selector] of pageContracts) {
  const legacy = await elementSnapshot("http://127.0.0.1:4173", route, selector);
  const next = await elementSnapshot("http://127.0.0.1:4174", route, selector);
  if (JSON.stringify(legacy) !== JSON.stringify(next)) {
    failures.push({ route, selector, legacy, next });
    console.error(`Page-shell mismatch: ${route}`);
  }
}

for (const route of ["/atom.xml", "/atom/series/datomic.xml", "/atom/series/advent_calendar_2019.xml"]) {
  const legacy = await feedSnapshot("http://127.0.0.1:4173", route);
  const next = await feedSnapshot("http://127.0.0.1:4174", route);
  if (JSON.stringify(legacy) !== JSON.stringify(next)) {
    failures.push({ route, legacy, next });
    console.error(`Atom mismatch: ${route}`);
  }
}

const interactionPage = await context.newPage();
await interactionPage.goto("http://127.0.0.1:4174/blog/2013/querying_datomic_for_history_of_entity/", {
  waitUntil: "domcontentloaded",
});
if (await interactionPage.locator("#original_post").evaluate((element) => getComputedStyle(element).height) !== "200px") {
  failures.push({ route: "/blog/2013/querying_datomic_for_history_of_entity/", interaction: "collapsed state" });
}
await interactionPage.locator("#original_post_button_real").click();
if (await interactionPage.locator("#original_post_button").count() !== 0) {
  failures.push({ route: "/blog/2013/querying_datomic_for_history_of_entity/", interaction: "expand button" });
}
await interactionPage.close();

if (process.env.PARITY_VISUAL === "1") {
  const visualContracts = [
    ["home-desktop-light", "/", 1280, 900, "light"],
    ["home-desktop-dark", "/", 1280, 900, "dark"],
    ["home-mobile", "/", 375, 812, "light"],
    ["word-post", "/blog/2023/blogging_with_word/", 1280, 900, "light"],
    ["markdown-post", "/blog/2019/amazing_lazy_data_structures/", 1280, 900, "light"],
    ["interactive-post-mobile", "/blog/2013/querying_datomic_for_history_of_entity/", 375, 812, "light"],
    ["series-mobile", "/series/datomic/", 375, 812, "light"],
    ["about", "/about/", 1280, 900, "light"],
    ["letconstvar", "/letconstvar/", 1280, 900, "light"],
  ];
  await mkdir(".parity/screenshots", { recursive: true });
  for (const [name, route, width, height, colorScheme] of visualContracts) {
    const screenshots = [];
    for (const [variant, baseURL] of [["legacy", "http://127.0.0.1:4173"], ["next", "http://127.0.0.1:4174"]]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme });
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) throw new Error(`${baseURL}${route} returned ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
      await writeFile(`.parity/screenshots/${name}-${variant}.png`, screenshot);
      screenshots.push(screenshot);
      await page.close();
    }
    const legacyPath = `.parity/screenshots/${name}-legacy.png`;
    const nextPath = `.parity/screenshots/${name}-next.png`;
    const imageError = screenshots[0].equals(screenshots[1]) ? 0 : await normalizedImageError(legacyPath, nextPath);
    if (imageError > 0.0001) {
      failures.push({ route, visual: name, normalizedImageError: imageError });
      console.error(`Visual mismatch: ${name} (${route}), normalized error ${imageError}`);
    }
  }
}

await browser.close();
nextServer.kill("SIGTERM");
legacyServer.close();

if (failures.length) {
  await mkdir(".parity", { recursive: true });
  await writeFile(".parity/article-failures.json", JSON.stringify(failures, null, 2));
  throw new Error(`${failures.length} parity checks failed`);
}

console.log(`All ${postRoutes.length} posts, page shells, and Atom feeds match the legacy output.`);
