import type { Metadata } from "next";

export const siteName = "Sui géneris";
export const siteDescription =
  "Revista editorial sobre historia del menswear, tejidos, íconos del vestir y cultura visual.";
export const siteLanguage = "es-ES";
export const siteLocale = "es_ES";
export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.SITE_URL?.trim() ||
  "https://suigeneris-one.vercel.app";

export function getAbsoluteUrl(path = "/") {
  return new URL(path, siteOrigin).toString();
}

export function getArticleUrl(slug: string) {
  return getAbsoluteUrl(`/articulos/${slug}`);
}

export function getCategoryUrl(slug: string) {
  return getAbsoluteUrl(`/categorias/${slug}`);
}

export function getStoryTypeUrl(slug: string) {
  return getAbsoluteUrl(`/explorar/${slug}`);
}

export function getFeedUrl() {
  return getAbsoluteUrl("/feed.xml");
}

export function getArticleIndexUrl() {
  return getAbsoluteUrl("/articles.json");
}

export function getLlmsUrl() {
  return getAbsoluteUrl("/llms.txt");
}

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  images?: string[];
  keywords?: string[];
  openGraphType?: "website" | "article";
  publishedTime?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  images,
  keywords,
  openGraphType = "website",
  publishedTime,
}: CreatePageMetadataOptions): Metadata {
  const canonical = getAbsoluteUrl(path);
  const normalizedImages = images?.length ? images : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: siteLocale,
      type: openGraphType,
      images: normalizedImages,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: normalizedImages ? "summary_large_image" : "summary",
      title,
      description,
      images: normalizedImages,
    },
  };
}
