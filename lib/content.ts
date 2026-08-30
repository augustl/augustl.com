import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import { gfmTable } from "micromark-extension-gfm-table";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { z } from "zod";
import { isSeriesName, type SeriesName } from "./series";

export const BASE_TITLE = "August Lilleaas' blog";
export const SITE_ORIGIN = "http://augustl.com";

const POSTS_ROOT = path.join(process.cwd(), "posts");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const frontmatterSchema = z.object({
  title: z.string(),
  date: z.string().regex(ISO_DATE),
  content_format: z.enum(["html", "markdown"]),
  archive_order: z.number().int().nonnegative(),
  series: z.string().optional(),
  updated: z.string().regex(ISO_DATE).optional(),
  rss_warning: z.boolean().optional(),
  unlisted: z.boolean().optional(),
}).strict();

type Frontmatter = z.infer<typeof frontmatterSchema>;

export type PostSource = {
  sourcePath: string;
  url: string;
  id: string;
  title: string;
  date: string;
  prettyDate: string;
  contentFormat: "html" | "markdown";
  archiveOrder: number;
  series?: SeriesName;
  updated?: string;
  rssWarning?: boolean;
  unlisted?: boolean;
  body: string;
};

export type RenderedPost = PostSource & { html: string };

function markdownFilesBelow(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFilesBelow(entryPath);
    return entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function prettyDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${day}, ${year}`;
}

function sourceToUrl(sourcePath: string): string {
  const relative = path.relative(POSTS_ROOT, sourcePath).split(path.sep).join("/");
  return `/${relative.replace(/\.md$/, "")}/`;
}

function loadPostSource(sourcePath: string): PostSource {
  const parsed = matter(readFileSync(sourcePath, "utf8"));
  const data: Frontmatter = frontmatterSchema.parse(parsed.data);
  if (data.series && !isSeriesName(data.series)) {
    throw new Error(`Unknown series ${data.series} in ${sourcePath}`);
  }
  const url = sourceToUrl(sourcePath);
  return {
    sourcePath,
    url,
    id: url.slice(0, -1).replaceAll("/", ":"),
    title: data.title,
    date: data.date,
    prettyDate: prettyDate(data.date),
    contentFormat: data.content_format,
    archiveOrder: data.archive_order,
    series: data.series as SeriesName | undefined,
    updated: data.updated,
    rssWarning: data.rss_warning,
    unlisted: data.unlisted,
    body: parsed.content.replace(/^\n/, "").replace(/\n$/, ""),
  };
}

const postSources = markdownFilesBelow(POSTS_ROOT)
  .map(loadPostSource)
  .sort((left, right) => left.archiveOrder - right.archiveOrder);

const duplicateUrl = postSources.find((post, index) => postSources.findIndex((candidate) => candidate.url === post.url) !== index);
if (duplicateUrl) throw new Error(`Duplicate post URL: ${duplicateUrl.url}`);

export function getAllPosts(): PostSource[] {
  return postSources;
}

export function getListedPosts(): PostSource[] {
  return postSources.filter((post) => !post.unlisted);
}

export function getPostBySegments(segments: string[]): PostSource | undefined {
  const url = `/${segments.join("/")}/`;
  return postSources.find((post) => post.url === url);
}

export function getPostsForSeries(series: SeriesName): PostSource[] {
  return getListedPosts().filter((post) => post.series === series);
}

async function renderMarkdown(markdown: string): Promise<string> {
  const rendered = await unified()
    .use(remarkParse)
    .use(function remarkTablesOnly() {
      const data = this.data();
      const micromarkExtensions = data.micromarkExtensions ?? (data.micromarkExtensions = []);
      const fromMarkdownExtensions = data.fromMarkdownExtensions ?? (data.fromMarkdownExtensions = []);
      micromarkExtensions.push(gfmTable());
      fromMarkdownExtensions.push(gfmTableFromMarkdown());
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown);
  return String(rendered);
}

export async function renderPost(post: PostSource): Promise<RenderedPost> {
  return {
    ...post,
    html: post.contentFormat === "html" ? post.body : await renderMarkdown(post.body),
  };
}

export function atomTimestamp(date: string): string {
  const probe = new Date(`${date}T12:00:00.000Z`);
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    timeZoneName: "longOffset",
  }).formatToParts(probe).find((part) => part.type === "timeZoneName")?.value;
  const match = /^GMT([+-]\d{2}:\d{2})$/.exec(offsetName ?? "");
  if (!match) throw new Error(`Could not determine Europe/Oslo offset for ${date}`);
  return `${date}T00:00:00.000${match[1]}`;
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
