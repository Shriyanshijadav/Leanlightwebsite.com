// Blog listing, built automatically from content/blogs/*.md
import PageView from "@/components/PageView";
import { getPage, getAllPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { blogIndexSchema } from "@/lib/schema";
import { blogIndexHtml } from "@/lib/blogHtml";

export function generateMetadata() {
  return pageMetadata(getPage("blog"));
}

export default function BlogIndex() {
  const page = getPage("blog");
  const posts = getAllPosts();
  return <PageView page={page} html={blogIndexHtml(posts)} schema={blogIndexSchema(page, posts)} />;
}
