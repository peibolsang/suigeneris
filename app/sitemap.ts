import type { MetadataRoute } from "next";
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
} from "@/lib/site-metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
    },
    {
      url: getAbsoluteUrl("/lecturas"),
    },
    {
      url: getAbsoluteUrl("/explorar"),
    },
    {
      url: getAbsoluteUrl("/populares"),
    },
  ];
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: getArticleUrl(article.slug),
    lastModified: new Date(article.publishedAt),
  }));
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: getCategoryUrl(category.slug),
  }));
  const storyTypeRoutes: MetadataRoute.Sitemap = storyTypes.map((storyType) => ({
    url: getStoryTypeUrl(storyType.slug),
  }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...categoryRoutes,
    ...storyTypeRoutes,
  ];
}
