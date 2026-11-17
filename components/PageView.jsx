// Renders one page: its structured data, then its designed HTML from content/page-html/.
import JsonLd from "./JsonLd";
import { pageSchema } from "@/lib/schema";

export default function PageView({ page, schema, html }) {
  return (
    <>
      <JsonLd data={schema || pageSchema(page)} />
      <main className="page" data-route={page.slug} data-tone={page.tone || "night"} dangerouslySetInnerHTML={{ __html: html ?? page.html }} />
    </>
  );
}
