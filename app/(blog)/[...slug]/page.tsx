import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostPage } from "../../../components/post-page";
import { BASE_TITLE, getAllPosts, getPostBySegments, plainTextTitle, renderPost } from "../../../lib/content";

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
  const title = plainTextTitle(post.title);
  const description = `A post by August Lilleaas, published ${post.prettyDate}.`;
  const imageUrl = `/og/?slug=${encodeURIComponent(post.url)}`;
  const socialImage = {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: title,
  };
  return {
    title: `${title} (${BASE_TITLE})`,
    description,
    alternates: {
      canonical: post.url,
      types: { "application/atom+xml": "/atom.xml" },
    },
    openGraph: {
      type: "article",
      siteName: BASE_TITLE,
      locale: "en_US",
      title,
      description,
      url: post.url,
      publishedTime: `${post.date}T00:00:00.000Z`,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      site: "@augustl",
      creator: "@augustl",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const source = await sourceFromParams(params);
  if (!source) notFound();
  return <PostPage post={await renderPost(source)} />;
}
