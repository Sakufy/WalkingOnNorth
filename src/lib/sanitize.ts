/**
 * HTML sanitizer — server & client using sanitize-html.
 *
 * Replaces isomorphic-dompurify (jsdom → ESM chain crash on Vercel).
 * sanitize-html is pure JS, zero DOM dependency, works everywhere.
 */

import sanitize from "sanitize-html";

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

const ALL_ATTRS = [
  "href", "target", "rel", "src", "alt",
  "data-p-id", "style", "class", "id",
  "colspan", "rowspan",
];

/**
 * DOMPurify-compatible config.
 * FORBID_STYLES: [] + ALLOW_UNKNOWN_PROTOCOLS ensures
 * background-image: url(), linear-gradient(), box-shadow
 * etc. survive the sanitization pipe.
 */
const PURIFY_CONFIG: sanitize.IOptions = {
  allowedTags: ALL_TAGS,
  allowedAttributes: Object.fromEntries(ALL_TAGS.map((t) => [t, ALL_ATTRS])),
  allowedStyles: {
    "*": {
      // Match any CSS property — knb.im uses inline styles heavily
      "*": [/.*/],
    },
  },
  allowProtocolRelative: true,
};

export async function sanitizeHtml(dirty: string): Promise<string> {
  return sanitize(dirty, PURIFY_CONFIG);
}

export function sanitizeHtmlSync(dirty: string): string {
  return sanitize(dirty, PURIFY_CONFIG);
}

export function sanitizePaste(dirty: string): string {
  return sanitize(dirty, PURIFY_CONFIG);
}
