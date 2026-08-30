import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostPage } from "../../../components/post-page";
import { BASE_TITLE, getAllPosts, getPostBySegments, renderPost } from "../../../lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.url.split("/").filter(Boolean) }));
}
async function sourceFromParams(params: Promise<{ slug: string[] }>) {
  const { slug } = await params;
  return getPostBySegments(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const post = await sourceFromParams(params);
  if (!post) notFound();
  return {
    title: `${post.title} (${BASE_TITLE})`,
    openGraph: {
      title: post.title,
      description: "The CRUD blog",
      url: post.url,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: "The CRUD blog",
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const source = await sourceFromParams(params);
  if (!source) notFound();
  return <PostPage post={await renderPost(source)} />;
}
