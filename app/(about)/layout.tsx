import type { Metadata } from "next";
import { BASE_TITLE } from "../../lib/content";

export const metadata: Metadata = {
  title: "(2) August Lilleaaaaaaaaaaaa;;;;;;",
  alternates: { types: { "application/atom+xml": "/atom.xml" } },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <head>
        <link href="/stylesheets/dddddddddddd.css" media="screen" rel="stylesheet" type="text/css" />
        <link href="/atom.xml" rel="alternate" title={BASE_TITLE} type="application/atom+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
