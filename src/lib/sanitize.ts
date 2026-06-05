/**
 * DOMPurify 封装 — 服务端 + 客户端通用
 *
 * knb.im / WeChat HTML is exclusively inline-style-driven.
 * We MUST NOT strip CSS properties — DOMPurify otherwise
 * drops linear-gradient, background-image: url(), box-shadow etc.
 */

/** All HTML elements knb.im / WeChat formatting tools use */
const ALL_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "u", "b", "i", "s", "del",
  "a", "blockquote",
  "ul", "ol", "li",
  "hr", "img", "br",
  "span", "section", "div",
  "mark", "code", "sub", "sup",
  "pre", "table", "thead", "tbody", "tr", "th", "td",
  "figcaption", "figure",
];

/** Attributes that survive sanitization */
const ALL_ATTRS = [
  "href", "target", "rel", "src", "alt",
  "data-p-id", "style", "class", "id",
  "colspan", "rowspan",
];

/**
 * DOMPurify config shared by all sanitization paths.
 * FORBID_STYLES + ALLOW_UNKNOWN_PROTOCOLS ensures
 * background-image: url(), linear-gradient(), box-shadow
 * etc. survive the sanitization pipe.
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ALL_TAGS,
  ALLOWED_ATTR: ALL_ATTRS,
  ALLOW_DATA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: true,
  // Disable CSS property filtering — knb.im uses
  // linear-gradient / url() / box-sizing etc.
  FORBID_STYLES: [] as string[],
};

export async function sanitizeHtml(dirty: string): Promise<string> {
  const { default: DOMPurify } = await import("isomorphic-dompurify");
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

export function sanitizeHtmlSync(dirty: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("isomorphic-dompurify").default;
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

export function sanitizePaste(dirty: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("isomorphic-dompurify").default;
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}
