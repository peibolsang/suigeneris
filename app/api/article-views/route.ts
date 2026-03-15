import { NextRequest, NextResponse } from "next/server";
import {
  isLocalDevelopmentTrackingDisabled,
  isTrackingProtectionConfigured,
  getPopularityCatalog,
  shouldTrackArticleViewRequest,
  trackArticleView,
  verifyArticleTrackingToken,
} from "@/lib/article-popularity";

export const runtime = "nodejs";

type ArticleViewPayload = {
  articleId?: unknown;
  token?: unknown;
};

function getClientIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  let payload: ArticleViewPayload;

  try {
    payload = (await request.json()) as ArticleViewPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof payload.articleId !== "string" || payload.articleId.trim().length === 0) {
    return NextResponse.json({ error: "Invalid articleId." }, { status: 400 });
  }

  const articleId = payload.articleId.trim();
  const token = typeof payload.token === "string" ? payload.token.trim() : "";
  const popularityCatalog = await getPopularityCatalog();

  if (!popularityCatalog.has(articleId)) {
    return NextResponse.json({ error: "Unknown articleId." }, { status: 400 });
  }

  const localDevelopmentTrackingDisabled = isLocalDevelopmentTrackingDisabled();
  const trackingProtectionConfigured = isTrackingProtectionConfigured();
  const trackingWritesEnabled =
    !localDevelopmentTrackingDisabled && trackingProtectionConfigured;
  const trackingTokenValid =
    !trackingProtectionConfigured ||
    verifyArticleTrackingToken(articleId, token);

  if (
    trackingWritesEnabled &&
    !trackingTokenValid
  ) {
    return NextResponse.json({ error: "Invalid tracking token." }, { status: 403 });
  }

  const ipAddress = getClientIpAddress(request);

  const shouldTrack = shouldTrackArticleViewRequest({
    articleId,
    ipAddress,
    userAgent: request.headers.get("user-agent"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    secFetchSite: request.headers.get("sec-fetch-site"),
    contentType: request.headers.get("content-type"),
  });
  const snapshot = await trackArticleView(articleId, {
    increment: trackingWritesEnabled && shouldTrack && trackingTokenValid,
    ipAddress,
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json(snapshot);
}
