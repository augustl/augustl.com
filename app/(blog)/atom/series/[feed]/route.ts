import { notFound } from "next/navigation";
import { atomFeed, atomResponse } from "../../../../../lib/atom";
import { getPostsForSeries } from "../../../../../lib/content";
import { isSeriesName, SERIES } from "../../../../../lib/series";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SERIES).map((name) => ({ feed: `${name}.xml` }));
}
export async function GET(_request: Request, { params }: { params: Promise<{ feed: string }> }) {
  const { feed } = await params;
  const name = feed.replace(/\.xml$/, "");
  if (!feed.endsWith(".xml") || !isSeriesName(name)) notFound();
  return atomResponse(await atomFeed(getPostsForSeries(name), SERIES[name].title));
}
