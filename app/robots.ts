import type { MetadataRoute } from "next";
import { getAbsoluteUrl, siteOrigin } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: siteOrigin,
  };
}
