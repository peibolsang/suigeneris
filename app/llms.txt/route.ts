import {
  categories,
  getAllArticles,
  storyTypes,
} from "@/lib/content";
import {
  getAbsoluteUrl,
  getArticleUrl,
  getCategoryUrl,
  getStoryTypeUrl,
  siteDescription,
  siteName,
} from "@/lib/site-metadata";

export const dynamic = "force-static";

export async function GET() {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 10)
    .map((article) => `- ${article.title}: ${getArticleUrl(article.slug)}`)
    .join("\n");
  const categoryLines = categories
    .map((category) => `- ${category.label}: ${getCategoryUrl(category.slug)}`)
    .join("\n");
  const storyTypeLines = storyTypes
    .map((storyType) => `- ${storyType.label}: ${getStoryTypeUrl(storyType.slug)}`)
    .join("\n");

  const content = `${siteName}
${siteDescription}

Site: ${getAbsoluteUrl("/")}
Language: es-ES

Primary feeds and machine-readable resources
- RSS feed: ${getAbsoluteUrl("/feed.xml")}
- Article index JSON: ${getAbsoluteUrl("/articles.json")}
- Sitemap: ${getAbsoluteUrl("/sitemap.xml")}

Main sections
- Inicio: ${getAbsoluteUrl("/")}
- Lecturas: ${getAbsoluteUrl("/lecturas")}
- Explorar: ${getAbsoluteUrl("/explorar")}
- Lo + popular: ${getAbsoluteUrl("/populares")}

Categories
${categoryLines}

Story types
${storyTypeLines}

Latest articles
${latestArticles}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
