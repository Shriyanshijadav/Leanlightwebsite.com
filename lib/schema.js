// JSON-LD structured data, generated automatically.
// Organization: homepage. Service / Article / WebApplication: from each page's schemaType.
// FAQPage: whenever a page or blog post has FAQs. BreadcrumbList: everywhere.
import siteConfig from "../siteConfig.js";
import { absoluteUrl } from "./seo.js";

const ORG_ID = () => absoluteUrl("/#organization");
const SITE_ID = () => absoluteUrl("/#website");
const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === "" || (Array.isArray(v) && !v.length) ? undefined : v)));
const text = (h) =>
  String(h || "")
    .replace(/<span class="tbc">To confirm: ([^<]*)<\/span>/g, "[$1]")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

export function organizationSchema() {
  const o = siteConfig.organization;
  const sameAs = Object.entries(siteConfig.social).filter(([k, v]) => k !== "twitterHandle" && v).map(([, v]) => v);
  return clean({
    "@type": "Organization",
    "@id": ORG_ID(),
    name: o.name,
    legalName: o.legalName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(o.logo),
    description: o.description,
    foundingDate: o.foundingDate,
    email: o.email,
    telephone: o.telephone,
    address: o.address.addressLocality ? { "@type": "PostalAddress", ...o.address } : "",
    areaServed: { "@type": "Country", name: o.areaServed },
    parentOrganization: { "@type": "Organization", ...o.parentOrganization },
    sameAs,
    contactPoint: o.telephone ? { "@type": "ContactPoint", telephone: o.telephone, contactType: "sales", areaServed: "IN", availableLanguage: ["en", "hi"] } : "",
  });
}

const orgRef = () => ({ "@type": "Organization", "@id": ORG_ID(), name: siteConfig.organization.name, url: absoluteUrl("/") });

export function breadcrumbSchema(items) {
  return { "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })) };
}

export function faqSchema(pairs) {
  if (!pairs || !pairs.length) return null;
  return { "@type": "FAQPage", mainEntity: pairs.map((p) => ({ "@type": "Question", name: text(p.question), acceptedAnswer: { "@type": "Answer", text: text(p.answer) } })) };
}

export function faqFromHtml(html) {
  const out = [];
  const re = /<details[^>]*><summary>([\s\S]*?)<i><\/i><\/summary><p>([\s\S]*?)<\/p><\/details>/g;
  let m;
  while ((m = re.exec(html || ""))) out.push({ question: m[1], answer: m[2] });
  return out;
}

export function pageSchema(page) {
  const url = absoluteUrl(page.canonicalUrl || page.path);
  const typeMap = { AboutPage: "AboutPage", ContactPage: "ContactPage", CollectionPage: "CollectionPage" };
  const g = [
    { "@type": "WebSite", "@id": SITE_ID(), url: absoluteUrl("/"), name: siteConfig.siteName, publisher: { "@id": ORG_ID() }, inLanguage: siteConfig.language },
    { "@type": typeMap[page.schemaType] || "WebPage", "@id": url + "#webpage", url, name: page.title, description: page.metaDescription, isPartOf: { "@id": SITE_ID() }, about: { "@id": ORG_ID() }, inLanguage: siteConfig.language, dateModified: page.lastModified || undefined },
  ];
  if (page.slug === "home" || page.schemaType === "Organization" || page.schemaType === "AboutPage") g.push(organizationSchema());
  else g.push(orgRef());
  if (page.breadcrumb && page.breadcrumb.length > 1) g.push(breadcrumbSchema(page.breadcrumb));
  if (page.schemaType === "Service")
    g.push({ "@type": "Service", name: page.serviceName || page.title, serviceType: page.serviceName || page.title, provider: { "@id": ORG_ID() }, areaServed: { "@type": "Country", name: "India" }, url, description: page.metaDescription });
  if (page.schemaType === "Article")
    g.push({ "@type": "Article", headline: page.title.split(" | ")[0], description: page.metaDescription, author: { "@id": ORG_ID() }, publisher: { "@id": ORG_ID() }, mainEntityOfPage: url, dateModified: page.lastModified || undefined, image: absoluteUrl(page.ogImage || siteConfig.defaultOgImage) });
  if (page.schemaType === "WebApplication")
    g.push({ "@type": "WebApplication", name: page.serviceName || page.title, url, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" } });
  const faq = faqSchema(faqFromHtml(page.html));
  if (faq) g.push(faq);
  return { "@context": "https://schema.org", "@graph": g };
}

export function postSchema(post) {
  const url = absoluteUrl(post.canonicalUrl || post.path);
  const g = [
    orgRef(),
    {
      "@type": "BlogPosting",
      "@id": url + "#article",
      headline: post.title,
      description: post.metaDescription,
      image: post.featuredImage ? absoluteUrl(post.featuredImage) : absoluteUrl(siteConfig.defaultOgImage),
      datePublished: post.publishDate,
      dateModified: post.updatedDate || post.publishDate,
      author: post.author === siteConfig.organization.name || /team$/i.test(post.author) ? { "@id": ORG_ID() } : { "@type": "Person", name: post.author },
      publisher: { "@id": ORG_ID() },
      mainEntityOfPage: url,
      articleSection: post.category,
      keywords: Array.isArray(post.tags) ? post.tags.join(", ") : undefined,
      inLanguage: siteConfig.language,
    },
    breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog/" }, { name: post.title, path: post.path }]),
  ];
  const faq = faqSchema(post.faq);
  if (faq) g.push(faq);
  return { "@context": "https://schema.org", "@graph": g };
}

export function blogIndexSchema(page, posts) {
  const url = absoluteUrl("/blog/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      orgRef(),
      { "@type": "Blog", "@id": url + "#blog", url, name: page.title, description: page.metaDescription, publisher: { "@id": ORG_ID() },
        blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: absoluteUrl(p.path), datePublished: p.publishDate })) },
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog/" }]),
    ],
  };
}
