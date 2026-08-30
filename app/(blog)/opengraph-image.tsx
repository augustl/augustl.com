import { ImageResponse } from "next/og";
import { SocialCard } from "../../components/social-card";
import { BASE_TITLE } from "../../lib/content";

export const alt = BASE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialCard title={BASE_TITLE} />, size);
}
