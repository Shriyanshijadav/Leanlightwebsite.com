// The reusable SEO helper. Every page and post calls buildMetadata(),
// which produces <title>, meta description, canonical, robots, Open Graph and Twitter tags.
import siteConfig from "../siteConfig.js";

export const absoluteUrl = (p = "/") => (/^https?:\/\//.test(p) ? p : new URL(p, siteConfig.siteUrl).toString());

export function buildMetadata({ title, description, path = "/", canonicalUrl, noindex, ogImage, type = "website", publishedTime, modifiedTime, authors }) {
  const t = title || siteConfig.defaultTitle;
  const d = description || siteConfig.defaultDescription;
  const url = canonicalUrl ? absoluteUrl(canonicalUrl) : absoluteUrl(path);
  const image = absoluteUrl(ogImage || siteConfig.defaultOgImage);
  return {
    title: { absolute: t },
    description: d,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
    openGraph: {
      type,
      url,
      title: t,
      description: d,
      siteName: siteConfig.siteName,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: t }],
      ...(type === "article" ? { publishedTime, modifiedTime, authors } : {}),
    },
    twitter: { card: "summary_large_image", title: t, description: d, images: [image], ...(siteConfig.social.twitterHandle ? { site: siteConfig.social.twitterHandle } : {}) },
  };
}

export const pageMetadata = (page) =>
  buildMetadata({ title: page.title, description: page.metaDescription, path: page.path, canonicalUrl: page.canonicalUrl, noindex: page.noindex, ogImage: page.ogImage });

export const postMetadata = (post) =>
  buildMetadata({
    title: post.title,
    description: post.metaDescription,
    path: post.path,
    canonicalUrl: post.canonicalUrl,
    noindex: post.noindex,
    ogImage: post.ogImage || post.featuredImage,
    type: "article",
    publishedTime: post.publishDate,
    modifiedTime: post.updatedDate,
    authors: [post.author],
  });
