import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BASE_TITLE, getPostsForSeries } from "../../../../lib/content";
import { isSeriesName, SERIES } from "../../../../lib/series";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SERIES).map((name) => ({ name }));
}

async function seriesName(params: Promise<{ name: string }>) {
  const { name } = await params;
  if (!isSeriesName(name)) notFound();
  return name;
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const name = await seriesName(params);
  return {
    title: `${SERIES[name].title} (${BASE_TITLE})`,
    alternates: {
      types: { "application/atom+xml": `/atom/series/${name}.xml` },
    },
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ name: string }> }) {
  const name = await seriesName(params);
  const series = SERIES[name];
  return (
    <>
      <div className="site-content">
        <p><a href="/" className="take-me-home">Take me home</a></p>
      </div>
      <div className="site-content site-content-main">
        <div>
          <h2>{`Series: ${series.title}`}</h2>
          <p>{series.description}</p>
          {getPostsForSeries(name).map((post) => (
            <p key={post.url}>
              <a href={post.url} dangerouslySetInnerHTML={{ __html: post.title }} />{` (${post.prettyDate})`}
            </p>
          ))}
          <hr />
          <p><a href={`/atom/series/${name}.xml`}>RSS</a></p>
        </div>
      </div>
    </>
  );
}
