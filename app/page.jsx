// Homepage. Edit its SEO in content/pages/home.md and its text in content/page-html/home.html.
import PageView from "@/components/PageView";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata(getPage("home"));
}

export default function Home() {
  return <PageView page={getPage("home")} />;
}
