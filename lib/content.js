// Reads pages (content/pages + content/page-html) and blog posts (content/blogs).
// Files whose name starts with "_" are ignored, so templates are never published.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import siteConfig from "../siteConfig.js";
import { renderMarkdown, readingTime } from "./markdown.js";

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, "content", "pages");
const HTML_DIR = path.join(ROOT, "content", "page-html");
const BLOG_DIR = path.join(ROOT, "content", "blogs");

const iso = (v) => (!v ? "" : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));
const mdFiles = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_")) : []);

export function getAllPages() {
  return mdFiles(PAGES_DIR)
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(PAGES_DIR, file), "utf8"));
      const slug = data.slug || file.replace(/\.md$/, "");
      const htmlFile = path.join(HTML_DIR, `${slug}.html`);
      return {
        ...data,
        slug,
        template: data.template || "html",
        lastModified: iso(data.lastModified),
        breadcrumb: data.breadcrumb || [],
        html: fs.existsSync(htmlFile) ? fs.readFileSync(htmlFile, "utf8") : "",
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export const getPage = (slug) => getAllPages().find((p) => p.slug === slug);
export function getPageByPath(parts) {
  const p = "/" + (parts || []).join("/") + "/";
  return getAllPages().find((x) => x.path === p && x.template === "html");
}

export function getAllPosts() {
  return mdFiles(BLOG_DIR)
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      const slug = String(data.slug || file.replace(/\.md$/, "")).trim();
      return {
        ...data,
        slug,
        title: data.title || slug,
        metaDescription: data.metaDescription || "",
        author: data.author || siteConfig.blog.defaultAuthor,
        publishDate: iso(data.publishDate),
        updatedDate: iso(data.updatedDate) || iso(data.publishDate),
        faq: Array.isArray(data.faq) ? data.faq.filter((f) => f && f.question && f.answer) : [],
        draft: data.draft === true,
        noindex: data.noindex === true,
        readingTime: readingTime(content),
        html: renderMarkdown(content),
        path: `/blog/${slug}/`,
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
}

export const getPost = (slug) => getAllPosts().find((p) => p.slug === slug);

export function relatedPosts(post, count = siteConfig.blog.relatedPosts) {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.category && p.category === post.category);
  return [...same, ...others.filter((p) => !same.includes(p))].slice(0, count);
}
