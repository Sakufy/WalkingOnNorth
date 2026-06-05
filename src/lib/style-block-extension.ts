/**
 * StyleBlock — preserves WeChat formatting containers.
 *
 * ProseMirror unwraps <section>/<div>/<figure> by default,
 * stripping their inline styles. This node recognizes these
 * tags and preserves their tag name, style, and class attrs.
 */
import { Node, mergeAttributes } from "@tiptap/core";

export const StyleBlock = Node.create({
  name: "styleBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      htmlTag: {
        default: "div",
        parseHTML: (el) => el.tagName.toLowerCase(),
      },
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute("style") ?? null,
      },
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute("class") ?? null,
        renderHTML: (attrs) => {
          if (!(attrs as Record<string, unknown>).class) return {};
          return { class: (attrs as Record<string, unknown>).class as string };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: "section[style]" },
      { tag: "div[style]" },
      { tag: "figure" },
      { tag: "figcaption" },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const tag = node.attrs.htmlTag as string;
    const cleanAttrs = { ...HTMLAttributes };
    delete cleanAttrs.htmlTag;
    return [tag, mergeAttributes(cleanAttrs), 0];
  },
});
