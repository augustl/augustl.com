import { atomFeed, atomResponse } from "../../../lib/atom";
import { BASE_TITLE, getListedPosts } from "../../../lib/content";

export const dynamic = "force-static";

export async function GET() {
  return atomResponse(await atomFeed(getListedPosts(), BASE_TITLE));
}
