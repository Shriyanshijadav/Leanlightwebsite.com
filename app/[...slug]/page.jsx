// Every other page comes from content/pages/*.md (SEO) + content/page-html/*.html (design).
import { notFound } from "next/navigation";
import PageView from "@/components/PageView";
import { getAllPages, getPageByPath } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPages()
    .filter((p) => p.template === "html" && p.slug !== "home")
    .map((p) => ({ slug: p.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getPageByPath(slug);
  return page ? pageMetadata(page) : {};
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = getPageByPath(slug);
  if (!page) notFound();
  return <PageView page={page} />;
}
