import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "(17) August August August August",
  alternates: { types: { "application/atom+xml": "/atom.xml" } },
};

export default function LetConstVarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html><body>{children}</body></html>;
}
