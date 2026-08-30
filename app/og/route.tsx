import { ImageResponse } from "next/og";
import { SocialCard } from "../../components/social-card";
import { getPostBySegments, plainTextTitle } from "../../lib/content";

const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  const post = slug ? getPostBySegments(slug.split("/").filter(Boolean)) : undefined;

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  return new ImageResponse(
    <SocialCard title={plainTextTitle(post.title)} date={post.prettyDate} />,
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
