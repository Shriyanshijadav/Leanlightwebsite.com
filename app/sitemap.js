// /sitemap.xml — updates itself whenever a page or blog post is added.
// Pages and posts with noindex: true are left out.
import { getAllPages, getAllPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const pages = getAllPages()
    .filter((p) => !p.noindex)
    .map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified || today, changeFrequency: "monthly", priority: p.slug === "home" ? 1 : p.path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6 }));
  const posts = getAllPosts()
    .filter((p) => !p.noindex)
    .map((p) => ({ url: absoluteUrl(p.path), lastModified: p.updatedDate || p.publishDate || today, changeFrequency: "monthly", priority: 0.6 }));
  return [...pages, ...posts];
}
