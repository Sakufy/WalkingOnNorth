/**
 * TipTap extension configuration for 北行之路
 *
 * WeChat Public Account rendering parity:
 * - Every node/mark preserves `style` attribute via addAttributes
 * - StarterKit with default paragraph/heading/blockquote/list disabled,
 *   replaced by style-preserving versions below.
 * - TextAlign, Underline, Link, Image, Placeholder, Typography
 */

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import { StyleSpan } from "./style-span-extension";
import { StyleBlock } from "./style-block-extension";

// ── Table extensions ──
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

// ── Style-preserving node extensions ──
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

/* ============================================
 * Helper: extend a node to preserve `style`
 * ============================================ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withStyle(Base: any) {
  return Base.extend({
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
  });
}

/* ============================================
 * WeChat-compatible extensions
 * ============================================ */
const StyleParagraph = withStyle(Paragraph);
const StyleHeading = withStyle(Heading).configure({ levels: [1, 2, 3] });
const StyleBlockquote = withStyle(Blockquote);
const StyleBulletList = withStyle(BulletList);
const StyleOrderedList = withStyle(OrderedList);
const StyleListItem = withStyle(ListItem);
const StyleTableCell = withStyle(TableCell);
const StyleTableHeader = withStyle(TableHeader);

export const editorExtensions = [
  StarterKit.configure({
    heading: false,
    paragraph: false,
    blockquote: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    codeBlock: false,
    link: false,        // replaced by Link.configure below
  }),
  StyleParagraph,
  StyleHeading,
  StyleBlockquote,
  StyleBulletList,
  StyleOrderedList,
  StyleListItem,
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: "noopener noreferrer" },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  Placeholder.configure({ placeholder: "开始写作，记录你的成长思考..." }),
  Typography,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
    defaultAlignment: "left",
  }),
  StyleSpan,
  StyleBlock,
  Table.configure({ resizable: false }),
  TableRow,
  StyleTableHeader,
  StyleTableCell,
];

/* ============================================
 * Toolbar definitions
 * ============================================ */
export type ToolbarAction =
  | "h1" | "h2" | "h3"
  | "bold" | "italic" | "underline"
  | "blockquote" | "bulletList" | "orderedList"
  | "horizontalRule" | "link" | "image"
  | "alignLeft" | "alignCenter" | "alignRight" | "alignJustify";

export interface ToolbarGroup {
  actions: ToolbarAction[];
}

export const toolbarGroups: ToolbarGroup[] = [
  { actions: ["h1", "h2", "h3"] },
  { actions: ["bold", "italic", "underline"] },
  { actions: ["alignLeft", "alignCenter", "alignRight", "alignJustify"] },
  { actions: ["blockquote", "bulletList", "orderedList"] },
  { actions: ["horizontalRule", "link", "image"] },
];
