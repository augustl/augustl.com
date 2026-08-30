import { atomTimestamp, SITE_ORIGIN, xmlEscape, type PostSource, renderPost } from "./content";

export async function atomFeed(posts: PostSource[], title: string): Promise<string> {
  const entries = await Promise.all(posts.slice(0, 20).map(async (source) => {
    const post = await renderPost(source);
    return `<entry><title>${xmlEscape(post.title)}</title><updated>${atomTimestamp(post.date)}</updated><author><name>August Lilleaas</name></author><link href="${SITE_ORIGIN}${post.url}" /><id>urn:augustl-com:feed:post:${post.id}</id><content type="html">${xmlEscape(post.html)}</content></entry>`;
  }));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><id>urn:augustl-com:feed</id><updated>${atomTimestamp(posts[0].date)}</updated><title type="text">${xmlEscape(title)}</title><link href="${SITE_ORIGIN}/atom.xml" rel="self" />${entries.join("")}</feed>`;
}
export function atomResponse(xml: string): Response {
  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
