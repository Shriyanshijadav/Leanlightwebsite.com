// /blog/rss.xml — RSS feed of blog posts. Updates itself.
import siteConfig from "@/siteConfig";
import { getAllPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";
const x = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = getAllPosts()
    .filter((p) => !p.noindex)
    .map((p) => `<item><title>${x(p.title)}</title><link>${absoluteUrl(p.path)}</link><guid>${absoluteUrl(p.path)}</guid><pubDate>${new Date(p.publishDate + "T00:00:00Z").toUTCString()}</pubDate><description>${x(p.metaDescription)}</description></item>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${x(siteConfig.siteName)} blog</title><link>${absoluteUrl("/blog/")}</link><description>${x(siteConfig.blog.intro)}</description><language>${siteConfig.language}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
