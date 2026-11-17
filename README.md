# LeanLight Solar website

Next.js (App Router) + Tailwind CSS, built for Vercel.

| I want to… | Open this |
|---|---|
| Put the site online for the first time | `HOW-TO-DEPLOY.md` |
| Change titles, descriptions, schema, redirects, publish a blog post | `HOW-TO-EDIT-SEO.md` |
| Change site name, domain, analytics, menu, social links | `siteConfig.js` |

## Where everything lives

```
siteConfig.js            ← site-wide settings (domain, menu, schema, analytics, redirects, robots)
content/
  pages/<page>.md        ← SEO for each page: title, meta description, canonical, noindex, schema type
  page-html/<page>.html  ← the designed text of each page (edit wording carefully, keep the tags)
  blogs/<post>.md        ← one file per blog post. Copy _template.md to start a new one
public/
  images/                ← images. Blog images go in public/images/blog/
  assets/engine.js       ← 3D scenes (do not edit)
  assets/site.js         ← menus, calculator, forms, animations (do not edit)
app/                     ← Next.js routes: sitemap, robots, RSS, llms.txt, blog, pages (no edits needed)
lib/                     ← SEO, schema and content helpers (no edits needed)
components/              ← small building blocks (no edits needed)
```

## Automatic SEO output

- `<title>`, meta description, canonical, robots, Open Graph and Twitter tags on every page and post
- JSON-LD: Organization (homepage, About), WebSite, WebPage, BreadcrumbList, Service, Article, WebApplication, BlogPosting, and FAQPage wherever FAQs exist
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/blog/rss.xml`, all regenerated on every deploy
- 301 redirects from `siteConfig.js`
