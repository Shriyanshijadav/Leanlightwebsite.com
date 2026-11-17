# How to manage SEO on this site

All edits can be made in the GitHub website: open a file, click the **pencil** icon, edit, then click **Commit changes**. Vercel publishes the change in 1 to 2 minutes.

**Safe-editing rules for the files below**
- Change only the text inside quote marks `"like this"`.
- Keep the spacing at the start of lines exactly as it is.
- `true` and `false` have no quote marks.
- If text contains a double quote mark, write it as `\"`.

---

## 1. Change a page's title, meta description, canonical or indexing

Open `content/pages/<page-name>.md`. Example: `content/pages/housing-society-solar.md`

```yaml
title: "Housing Society Solar in India: Common Area Savings & Subsidy | LeanLight Solar"
metaDescription: "Rooftop solar for housing societies and RWAs across India…"
canonicalUrl: ""          # leave empty unless you need a different canonical
noindex: false            # true = hidden from Google and removed from the sitemap
ogImage: ""               # e.g. "/images/society-share.jpg". Empty = default image
lastModified: "2026-11-17" # update when you change the page
schemaType: Service       # Service, Article, WebPage, WebApplication, AboutPage, ContactPage, CollectionPage
```

Do not change `slug`, `path`, `tone` or `template`. They connect the page to its design.

## 2. Change the wording on a page

Open `content/page-html/<page-name>.html`. This is the designed page.
- Change words between the tags. Do not delete `<` `>` tags, `class="…"` or `data-…` attributes.
- Each FAQ is `<details><summary>Question<i></i></summary><p>Answer</p></details>`. Edit the question and answer text and the FAQPage schema updates itself. To add an FAQ, copy one whole `<details>…</details>` block and paste it after another.
- Dashed **To confirm** boxes look like `<span class="tbc">To confirm: …</span>`. Replace the whole span with the real fact.

## 3. Publish a blog post

1. Open `content/blogs/` and open `_template.md`. Copy all its text.
2. In `content/blogs/`, click **Add file → Create new file**. Name it after the URL you want, e.g. `net-metering-maharashtra.md`.
3. Paste, fill in the frontmatter at the top, and write the post below the second `---` in Markdown.
4. Set `draft: false` and commit.

The post appears at `/blog/<slug>/`, on the blog listing, in the sitemap, the RSS feed and `llms.txt`. Article and BreadcrumbList schema are created automatically, plus FAQPage schema if you fill in `faq`.

| Frontmatter field | What it does |
|---|---|
| `title` | `<title>`, H1 and Open Graph title |
| `metaDescription` | Meta description and the summary under the H1 |
| `slug` | The URL: `/blog/<slug>/` |
| `publishDate` / `updatedDate` | Dates on the post, in schema and in the sitemap |
| `author` | Byline. A person's name becomes a Person in the Article schema |
| `category` | Shown on the card. Related posts prefer the same category |
| `featuredImage` / `featuredImageAlt` | Image at the top, on the card and for social sharing. Upload to `public/images/blog/` (1200 × 630 px) |
| `canonicalUrl` | Only if the post was first published elsewhere |
| `noindex` | `true` keeps it out of Google and the sitemap |
| `draft` | `true` hides it from the site entirely |
| `faq` | Questions and answers shown at the end, with FAQPage schema |

To upload an image: open `public/images/blog/`, click **Add file → Upload files**.

## 4. Redirect an old URL

Open `siteConfig.js` and add a line inside `redirects`:

```js
redirects: [
  { from: "/solar-subsidy-in-india/", to: "/pm-surya-ghar-subsidy/" },
  { from: "/old-page/", to: "/new-page/" },
],
```

These are permanent (301/308) redirects.

## 5. Site-wide settings in `siteConfig.js`

| Setting | Use it for |
|---|---|
| `siteUrl` | Your live domain. Used by canonicals, sitemap, schema |
| `defaultTitle`, `defaultDescription`, `defaultOgImage` | Fallbacks |
| `verification.google` / `.bing` | Search Console and Bing Webmaster verification |
| `analytics.ga4Id` / `.gtmId` | Google Analytics 4 or Tag Manager |
| `organization` | Organization schema: legal name, logo, phone, email, address, founding date |
| `social` | Profile links, also used as `sameAs` in schema |
| `robots.disallow` / `robots.aiCrawlers` | What crawlers may access, and which AI crawlers are allowed |
| `navigation`, `footer` | Menu and footer links |

## 6. Where to check your work

- `/sitemap.xml` and `/robots.txt` on the live site
- Google's Rich Results Test (search.google.com/test/rich-results) for schema
- Search Console → URL Inspection after publishing
