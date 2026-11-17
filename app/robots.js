// /robots.txt — settings in siteConfig.js under "robots".
import siteConfig from "@/siteConfig";
import { absoluteUrl } from "@/lib/seo";

export default function robots() {
  const disallow = siteConfig.robots.disallow || [];
  return {
    rules: [
      { userAgent: "*", allow: "/", ...(disallow.length ? { disallow } : {}) },
      ...siteConfig.robots.aiCrawlers.map((ua) => ({ userAgent: ua, allow: "/", ...(disallow.length ? { disallow } : {}) })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.siteUrl,
  };
}
