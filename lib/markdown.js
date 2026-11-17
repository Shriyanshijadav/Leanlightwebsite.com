// Turns a blog post's Markdown into HTML. {{text}} becomes a "to confirm" marker.
import { marked } from "marked";

marked.setOptions({ gfm: true });

export function renderMarkdown(md) {
  const withMarks = String(md || "").replace(/\{\{([^}]+)\}\}/g, '<span class="tbc">To confirm: $1</span>');
  let html = marked.parse(withMarks);
  // wrap tables so they scroll on phones
  html = html.replace(/<table>/g, '<div class="tblwrap"><table>').replace(/<\/table>/g, "</table></div>");
  return html;
}

export function readingTime(md) {
  const words = String(md || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
