// Markup for the blog listing and blog posts, in the site's design system.
import siteConfig from "../siteConfig.js";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
export const fmtDate = (d) => {
  if (!d) return "";
  const x = new Date(d + "T00:00:00");
  return isNaN(x) ? d : x.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

function card(p) {
  const img = p.featuredImage ? `<img src="${esc(p.featuredImage)}" alt="${esc(p.featuredImageAlt || p.title)}" loading="lazy" width="1200" height="630">` : "";
  return `<a class="postcard" href="${esc(p.path)}">${img}<div class="flex flex-col gap-3 p-6">
<span class="text-[.78rem] text-[color:var(--accent)]">${esc(p.category || "Guide")}</span>
<h3>${esc(p.title)}</h3><p class="text-[.93rem] text-[color:var(--soft)]">${esc(p.metaDescription)}</p>
<span class="mt-1 border-t border-[color:var(--line)] pt-3 text-[.8rem] text-[color:var(--mute)]">${fmtDate(p.publishDate)} · ${p.readingTime} min read</span></div></a>`;
}

function grid(posts) {
  return `<div class="grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] md:grid-cols-2 lg:grid-cols-3">${posts.map(card).join("")}</div>`;
}

export function blogIndexHtml(posts, cfg = siteConfig) {
  const empty = `<p class="lede">The first articles are being written. Meanwhile, start with the guides below.</p>`;
  return `<section class="hero hero--statement"><div class="wrap"><div class="over">
<nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="/">Home</a></li><li aria-current="page">Blog</li></ol></nav>
<h1>${esc(cfg.blog.title)}</h1><p class="lede" style="margin-top:22px">${esc(cfg.blog.intro)}</p></div>
<div class="view" data-view="wafer" aria-hidden="true"></div></div></section>
<section class="sec"><div class="wrap"><div class="head rv"><h2>Latest articles</h2><p class="lede">${posts.length} ${posts.length === 1 ? "article" : "articles"}, newest first.</p></div>${posts.length ? grid(posts) : empty}</div></section>
<section class="sec sec--alt"><div class="wrap"><div class="head rv"><h2>Start with the guides</h2><p class="lede">The reference pages on this site.</p></div>
<div class="cards" style="--n:3">
<article class="card rv"><h3>PM Surya Ghar subsidy</h3><p>Amounts, eligibility, documents and the eight-step application.</p><a class="more" href="/pm-surya-ghar-subsidy/">Read the guide <span aria-hidden="true">→</span></a></article>
<article class="card rv"><h3>Solar system sizes</h3><p>1 kW to 10 kW compared on panels, roof area, generation and cost.</p><a class="more" href="/solar-system-sizes/">Compare sizes <span aria-hidden="true">→</span></a></article>
<article class="card rv"><h3>Solar savings calculator</h3><p>Your bill in, system size, saving and payback out.</p><a class="more" href="/solar-savings-calculator/">Open the calculator <span aria-hidden="true">→</span></a></article>
</div></div></section>`;
}

export function blogPostHtml(post, related = []) {
  const img = post.featuredImage
    ? `<img class="w-full rounded-md border border-[color:var(--line)]" src="${esc(post.featuredImage)}" alt="${esc(post.featuredImageAlt || post.title)}" width="1200" height="630">`
    : `<div class="view" data-view="wafer" aria-hidden="true" style="height:320px"></div>`;
  const updated = post.updatedDate && post.updatedDate !== post.publishDate ? ` · Updated ${fmtDate(post.updatedDate)}` : "";
  const faq = post.faq && post.faq.length
    ? `<section class="sec sec--alt"><div class="wrap"><div class="faqgrid"><div class="rv"><h2>Frequently asked questions</h2></div><div class="faq">${post.faq
        .map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.question)}<i></i></summary><p>${esc(f.answer)}</p></details>`)
        .join("")}</div></div></div></section>`
    : "";
  const rel = related.length ? `<section class="sec"><div class="wrap"><div class="head rv"><h2>Keep reading</h2></div>${grid(related)}</div></section>` : "";
  return `<section class="hero"><div class="wrap grid items-center gap-10 pb-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"><div>
<nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="/">Home</a></li><li><a href="/blog/">Blog</a></li><li aria-current="page">${esc(post.category || "Article")}</li></ol></nav>
<h1 class="!text-[clamp(2rem,4vw,3.4rem)]">${esc(post.title)}</h1>
<p class="lede" style="margin-top:20px">${esc(post.metaDescription)}</p>
<p class="mt-6 text-[.88rem] text-[color:var(--mute)]">By ${esc(post.author)} · ${fmtDate(post.publishDate)}${updated} · ${post.readingTime} min read</p></div>${img}</div></section>
<section class="sec" style="padding-top:clamp(30px,4vw,60px)"><div class="wrap grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
<article class="article">${post.html}</article>
<aside class="lg:sticky lg:top-28 self-start"><div class="sheet"><h3>Get a free site assessment</h3>
<p class="mt-3 text-[.93rem] text-[color:var(--soft)]">An engineer measures your roof and gives you one written price, with the subsidy worked in.</p>
<div class="cta-row" style="margin-top:18px"><a class="btn" href="/contact/">Request my quote ${ARROW}</a></div>
<p class="mt-5 text-[.88rem]"><a class="text-[color:var(--accent)] underline" href="/solar-savings-calculator/">Or estimate your savings first</a></p></div></aside>
</div></section>${faq}${rel}`;
}
