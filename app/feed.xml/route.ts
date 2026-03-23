import { getAllArticles } from "@/lib/content";
import {
  getAbsoluteUrl,
  getArticleUrl,
  siteDescription,
  siteName,
} from "@/lib/site-metadata";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const articles = await getAllArticles();
  const items = articles
    .map(
      (article) => `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${getArticleUrl(article.slug)}</link>
          <guid>${getArticleUrl(article.slug)}</guid>
          <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
          <description>${escapeXml(article.excerpt)}</description>
        </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${getAbsoluteUrl("/")}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>es-ES</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
