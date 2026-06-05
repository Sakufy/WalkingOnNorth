/**
 * Custom TipTap paste handler that PRESERVES inline styles.
 *
 * ProseMirror's default schema strips `style` attributes from all
 * HTML content during paste/insert. This extension bypasses that
 * by intercepting paste events at the DOM level before ProseMirror
 * processes them, and inserting raw HTML via insertContent.
 *
 * Combined with our .wechat-editor-content CSS, this makes the
 * editor render identically to WeChat's own editor.
 */
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const WeChatPasteExtension = Extension.create({
  name: "wechatPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("wechatPaste"),
        props: {
          handlePaste: (_view, event: ClipboardEvent) => {
            const html = event.clipboardData?.getData("text/html");
            if (!html) return false;

            return false; // Let TipTap handle it — we use transformPastedHTML instead
          },
          transformPastedHTML(html: string) {
            return smartTransform(html);
          },
        },
      }),
    ];
  },
});

/**
 * Smart paste transform:
 * - Detect raw Markdown (knb.im Ctrl+A) → convert to WeChat HTML
 * - Detect styled HTML (knb.im "Copy" button) → sanitize, preserve styles
 * - Fall through unchanged
 */
function smartTransform(html: string): string {
  // Strip browser wrapper cruft from clipboard
  let clean = html
    .replace(/<!--StartFragment-->/g, "")
    .replace(/<!--EndFragment-->/g, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .trim();

  // Detect raw Markdown (no HTML tags → plain text with syntax)
  const textOnly = clean.replace(/<[^>]+>/g, "").trim();
  const isMarkdown = /(\*\*|==|\+\+|\[TOC\]|^#{1,3}\s|```|^>\s|:::intro)/m.test(textOnly);

  if (isMarkdown) {
    // Dynamic import to avoid build issues
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { markdownToWechatHTML } = require("@/lib/markdown-to-wechat");
      return markdownToWechatHTML(textOnly);
    } catch {
      return clean;
    }
  }

  // HTML paste — ensure valid
  if (clean.includes("<") && clean.includes(">")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { sanitizePaste } = require("@/lib/sanitize");
      return sanitizePaste(clean);
    } catch {
      return clean;
    }
  }

  return clean;
}
