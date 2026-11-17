// Builds the header (mega menu) and footer HTML from siteConfig.js.
// You should not need to edit this file: change the menu in siteConfig.js.
import siteConfig from "../siteConfig.js";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="13" r="6" fill="#FFB020"/><path d="M16 1v3M28 13h3M1 13h3M24.5 4.5l2 2M5.5 4.5l2 2" stroke="#FFB020" stroke-width="1.6" stroke-linecap="round"/><path d="M3 27h26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const a = (href, text, cls = "") => `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ""}>${esc(text)}</a>`;

export function headerHtml(cfg = siteConfig) {
  const n = cfg.navigation;
  const sol = n.solutions
    .map((g) => `<div><p class="label">${esc(g.label)}</p><h3>${g.href ? a(g.href, g.title) : esc(g.title)}</h3><p class="sub">${esc(g.description)}</p><ul>${g.children.map((c) => `<li>${a(c.href, c.title)}</li>`).join("")}</ul></div>`)
    .join("");
  const res = n.resources.map((r) => `<div><h3>${a(r.href, r.title)}</h3><p class="sub">${esc(r.description)}</p></div>`).join("");
  const drawerSol = n.solutions
    .map((g) => (g.href ? a(g.href, g.title, "head") : "") + g.children.map((c) => a(c.href, c.title)).join(""))
    .join("");
  return `<header class="nav" id="nav"><div class="nav-in">
<a class="brand" href="/" aria-label="${esc(cfg.siteName)} home">${LOGO}${esc(cfg.siteName)}</a>
<ul class="menu">
<li class="nav-home">${a("/", "Home")}</li>
<li><button type="button" aria-expanded="false" aria-controls="mega-sol">Solar Solutions <i></i></button></li>
<li>${a(n.projects.href, n.projects.title)}</li><li>${a(n.subsidy.href, n.subsidy.title)}</li>
<li><button type="button" aria-expanded="false" aria-controls="mega-res">Resources <i></i></button></li>
<li>${a(n.about.href, n.about.title)}</li></ul>
<a class="btn q" href="#quote" data-go="quote">${esc(n.quoteButton)}</a>
<button class="burger" type="button" aria-label="Menu" aria-expanded="false"><i></i></button></div>
<div class="mega" id="mega-sol"><div class="mega-in">${sol}</div></div>
<div class="mega" id="mega-res"><div class="mega-in res">${res}</div></div>
<div class="drawer">${a("/", "Home", "nav-home")}
<details><summary>Solar Solutions</summary><div class="grp">${drawerSol}</div></details>
${a(n.projects.href, n.projects.title)}${a(n.subsidy.href, n.subsidy.title)}
<details><summary>Resources</summary><div class="grp">${n.resources.map((r) => a(r.href, r.title)).join("")}</div></details>
${a(n.about.href, n.about.title)}${a(n.contact.href, n.contact.title)}<a class="btn" href="#quote" data-go="quote">${esc(n.quoteButton)}</a></div>
<span class="prog" aria-hidden="true"></span></header>`;
}

export function footerHtml(cfg = siteConfig) {
  const f = cfg.footer;
  const cols = f.columns.map((c) => `<div><h4>${esc(c.heading)}</h4><ul>${c.links.map((l) => `<li>${a(l.href, l.title)}</li>`).join("")}</ul></div>`).join("");
  const year = new Date().getFullYear();
  return `<footer><div class="wrap"><div class="foot">
<div><a class="brand" href="/">${LOGO}${esc(cfg.siteName)}</a><p>${esc(f.tagline)}</p></div>${cols}</div>
<div class="legal"><span>© ${year} ${esc(f.legalLine)}</span><span>${esc(f.credit)}</span></div></div></footer>
<div class="mbar"><a class="btn line" href="/solar-savings-calculator/">Calculate savings</a><a class="btn" href="#quote" data-go="quote">Get a quote</a></div>`;
}
