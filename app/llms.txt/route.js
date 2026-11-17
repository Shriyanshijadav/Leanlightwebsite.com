// /llms.txt — a plain-text map of the site for AI assistants. Updates itself.
import siteConfig from "@/siteConfig";
import { getAllPages, getAllPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const pages = getAllPages().filter((p) => !p.noindex);
  const posts = getAllPosts().filter((p) => !p.noindex);
  const line = (t, u, d) => `- [${t}](${absoluteUrl(u)}): ${d}`;
  const body = [
    `# ${siteConfig.siteName}`,
    "",
    `> ${siteConfig.organization.description}`,
    "",
    "## Pages",
    ...pages.map((p) => line(p.title.split(" | ")[0], p.path, p.metaDescription)),
    "",
    "## Blog",
    ...posts.map((p) => line(p.title, p.path, p.metaDescription)),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
