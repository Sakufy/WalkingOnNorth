"use client";

import { type Editor } from "@tiptap/react";
import { useCallback } from "react";
import { type ToolbarAction } from "@/lib/editor-extensions";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

const actionIcon: Record<ToolbarAction, React.ReactNode> = {
  h1: <Heading1 className="w-4 h-4" />,
  h2: <Heading2 className="w-4 h-4" />,
  h3: <Heading3 className="w-4 h-4" />,
  bold: <Bold className="w-4 h-4" />,
  italic: <Italic className="w-4 h-4" />,
  underline: <UnderlineIcon className="w-4 h-4" />,
  blockquote: <Quote className="w-4 h-4" />,
  bulletList: <List className="w-4 h-4" />,
  orderedList: <ListOrdered className="w-4 h-4" />,
  horizontalRule: <Minus className="w-4 h-4" />,
  link: <LinkIcon className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  alignLeft: <AlignLeft className="w-4 h-4" />,
  alignCenter: <AlignCenter className="w-4 h-4" />,
  alignRight: <AlignRight className="w-4 h-4" />,
  alignJustify: <AlignJustify className="w-4 h-4" />,
};

const actionLabel: Record<ToolbarAction, string> = {
  h1: "标题 1",
  h2: "标题 2",
  h3: "标题 3",
  bold: "加粗",
  italic: "斜体",
  underline: "下划线",
  blockquote: "引用",
  bulletList: "无序列表",
  orderedList: "有序列表",
  horizontalRule: "分隔线",
  link: "链接",
  image: "图片",
  alignLeft: "左对齐",
  alignCenter: "居中",
  alignRight: "右对齐",
  alignJustify: "两端对齐",
};

interface Props {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<string>;
}

export default function EditorToolbar({ editor, onImageUpload }: Props) {
  const executeAction = useCallback(
    (action: ToolbarAction) => {
      if (!editor) return;

      switch (action) {
        case "h1":
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case "h2":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "h3":
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case "bold":
          editor.chain().focus().toggleBold().run();
          break;
        case "italic":
          editor.chain().focus().toggleItalic().run();
          break;
        case "underline":
          editor.chain().focus().toggleUnderline().run();
          break;
        case "blockquote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "bulletList":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "orderedList":
          editor.chain().focus().toggleOrderedList().run();
          break;
        case "horizontalRule":
          editor.chain().focus().setHorizontalRule().run();
          break;
        case "link": {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("输入链接地址", previousUrl || "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
          } else {
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }
          break;
        }
        case "image":
          handleImageClick(editor, onImageUpload);
          break;
        case "alignLeft":
          editor.chain().focus().setTextAlign("left").run();
          break;
        case "alignCenter":
          editor.chain().focus().setTextAlign("center").run();
          break;
        case "alignRight":
          editor.chain().focus().setTextAlign("right").run();
          break;
        case "alignJustify":
          editor.chain().focus().setTextAlign("justify").run();
          break;
      }
    },
    [editor, onImageUpload]
  );

  const isActive = useCallback(
    (action: ToolbarAction): boolean => {
      if (!editor) return false;

      switch (action) {
        case "h1":
          return editor.isActive("heading", { level: 1 });
        case "h2":
          return editor.isActive("heading", { level: 2 });
        case "h3":
          return editor.isActive("heading", { level: 3 });
        case "bold":
          return editor.isActive("bold");
        case "italic":
          return editor.isActive("italic");
        case "underline":
          return editor.isActive("underline");
        case "blockquote":
          return editor.isActive("blockquote");
        case "bulletList":
          return editor.isActive("bulletList");
        case "orderedList":
          return editor.isActive("orderedList");
        case "link":
          return editor.isActive("link");
        case "alignLeft":
          return editor.isActive({ textAlign: "left" });
        case "alignCenter":
          return editor.isActive({ textAlign: "center" });
        case "alignRight":
          return editor.isActive({ textAlign: "right" });
        case "alignJustify":
          return editor.isActive({ textAlign: "justify" });
        default:
          return false;
      }
    },
    [editor]
  );

  if (!editor) return null;

  const groups: ToolbarAction[][] = [
    ["h1", "h2", "h3"],
    ["bold", "italic", "underline"],
    ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
    ["blockquote", "bulletList", "orderedList"],
    ["horizontalRule", "link", "image"],
  ];

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border px-3 py-2 flex flex-wrap gap-1">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && (
            <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />
          )}
          {group.map((action) => {
            const active = isActive(action);
            return (
              <button
                key={action}
                type="button"
                onClick={() => executeAction(action)}
                title={actionLabel[action]}
                className={`p-1.5 rounded-sm transition-colors duration-150 ${
                  active
                    ? "bg-primary-light text-primary-hover"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                {actionIcon[action]}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Hidden file input trigger for image upload
 */
function handleImageClick(
  editor: Editor | null,
  onUpload: (file: File) => Promise<string>
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/webp,image/png,image/jpeg";
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !editor) return;
    try {
      const url = await onUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("图片上传失败，请重试");
    }
  };
  input.click();
}
