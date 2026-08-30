import type { Metadata } from "next";
import { BASE_TITLE, SITE_ORIGIN } from "../../lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: BASE_TITLE,
  icons: { icon: "/favicon.ico" },
  alternates: {
    types: { "application/atom+xml": "/atom.xml" },
  },
};

export default function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <head>
        <link href="/stylesheets/screen.css" media="screen" rel="stylesheet" type="text/css" />
        <link href="/stylesheets/dark-mode.css" media="screen" rel="stylesheet" type="text/css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
