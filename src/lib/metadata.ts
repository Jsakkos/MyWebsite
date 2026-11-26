import type { Metadata } from "next";
import { getProfile } from "@/lib/content";

export const SITE_URL = "https://www.jonathanksakkos.com";
export const SITE_NAME = "Jonathan Sakkos";
export const OG_IMAGE = "/og-image.png";
export const DEFAULT_TITLE = `${SITE_NAME} · ${getProfile().basics.label}`;

export function pageMetadata(opts: { title?: string; description?: string; path: string }): Metadata {
  const { basics } = getProfile();
  const description = opts.description ?? basics.throughline;
  const title = opts.title ?? DEFAULT_TITLE;
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.title ?? { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME}, ${basics.label}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}
