import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-700.css";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import {
  getAbsoluteUrl,
  getArticleIndexUrl,
  getFeedUrl,
  getLlmsUrl,
  siteDescription,
  siteLanguage,
  siteLocale,
  siteName,
  siteOrigin,
} from "@/lib/site-metadata";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  description: siteDescription,
  url: getAbsoluteUrl("/"),
  inLanguage: siteLanguage,
  publisher: {
    "@type": "Organization",
    name: siteName,
    url: getAbsoluteUrl("/"),
  },
  hasPart: [
    {
      "@type": "DataFeed",
      name: "RSS Feed",
      url: getFeedUrl(),
    },
    {
      "@type": "DataFeed",
      name: "Article Index JSON",
      url: getArticleIndexUrl(),
    },
    {
      "@type": "DigitalDocument",
      name: "llms.txt",
      url: getLlmsUrl(),
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteName,
    description:
      "Historia, tejidos y cultura del vestir masculino: workwear, Ivy, militaria y elegancia casual.",
    siteName,
    type: "website",
    locale: siteLocale,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${GeistSans.variable} antialiased`}>
        <div className="relative mx-auto min-h-screen max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10">
          <SiteHeader />
          {children}
          <footer className="mt-24 border-t border-[var(--line-strong)] px-2 py-8 text-sm text-[var(--muted)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                  Sui géneris
                </p>
                <p className="mt-2 max-w-xl text-balance">
                  Un archivo vivo sobre prendas, tejidos e imaginarios del
                  vestir masculino.
                </p>
              </div>
              <p className="max-w-md text-balance md:text-right">
                Workwear, Americana, militaria, Ivy y elegancia casual
                estudiados desde la historia material y la cultura visual.
              </p>
            </div>
          </footer>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
