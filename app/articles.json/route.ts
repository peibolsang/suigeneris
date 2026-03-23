import { getAllArticles, getStoryTypeFromLabel } from "@/lib/content";
import {
  getAbsoluteUrl,
  getArticleIndexUrl,
  getArticleUrl,
  getCategoryUrl,
  getFeedUrl,
  getLlmsUrl,
  getStoryTypeUrl,
  siteDescription,
  siteLanguage,
  siteName,
} from "@/lib/site-metadata";

export const dynamic = "force-static";

export async function GET() {
  const articles = await getAllArticles();

  return Response.json({
    site: {
      name: siteName,
      description: siteDescription,
      language: siteLanguage,
      url: getAbsoluteUrl("/"),
    },
    resources: {
      self: getArticleIndexUrl(),
      feed: getFeedUrl(),
      llms: getLlmsUrl(),
      sitemap: getAbsoluteUrl("/sitemap.xml"),
    },
    generatedAt: new Date().toISOString(),
    articles: articles.map((article) => {
      const storyType = getStoryTypeFromLabel(article.storyType);

      return {
        url: getArticleUrl(article.slug),
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        publishedAt: article.publishedAt,
        publishedLabel: article.publishedLabel,
        category: article.category,
        categoryLabel: article.categoryLabel,
        categoryUrl: article.category ? getCategoryUrl(article.category) : null,
        storyType: article.storyType,
        storyTypeUrl: storyType ? getStoryTypeUrl(storyType.slug) : null,
        heroImage: getAbsoluteUrl(article.heroImage),
        heroAlt: article.heroAlt,
        featured: article.featured,
      };
    }),
  });
}
