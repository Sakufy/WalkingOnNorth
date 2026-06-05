/**
 * StyleSpan — a custom TipTap Mark extension that preserves
 * inline styled <span> elements from WeChat formatting tools.
 *
 * Without this, ProseMirror treats <span style="color:red"> as
 * transparent and loses all inline styling.
 */
import { Mark } from "@tiptap/core";

export const StyleSpan = Mark.create({
  name: "styleSpan",

  inclusive: true,

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute?.("style") ?? null,
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.style) return {};
          return { style: attributes.style as string };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[style]",
        getAttrs: (element) => {
          const style = (element as HTMLElement).getAttribute?.("style");
          return style ? { style } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});
