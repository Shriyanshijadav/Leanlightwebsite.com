// One blog post, built automatically from content/blogs/<slug>.md
import { notFound } from "next/navigation";
import PageView from "@/components/PageView";
import { getAllPosts, getPost, relatedPosts } from "@/lib/content";
import { postMetadata } from "@/lib/seo";
import { postSchema } from "@/lib/schema";
import { blogPostHtml } from "@/lib/blogHtml";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? postMetadata(post) : {};
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const page = { slug: `blog-${post.slug}`, tone: "paper" };
  return <PageView page={page} html={blogPostHtml(post, relatedPosts(post))} schema={postSchema(post)} />;
}
