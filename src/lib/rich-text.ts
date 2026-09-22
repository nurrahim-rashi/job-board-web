import DOMPurify from "dompurify";

// Mirrors api/lib/sanitize-html.ts — the marks RichTextEditor can actually
// produce. The API already sanitizes on save; this is a second, independent
// pass so a stale cache or a future write path can't slip raw markup onto
// a page every visitor loads.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "s",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
];

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

export function sanitizeRichTextHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href"],
  });
}

/** Strips all markup, for previews (job/company cards) that only render text. */
export function stripRichTextToPlainText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
}

export function isRichTextEmpty(html: string): boolean {
  return stripRichTextToPlainText(html).length === 0;
}
