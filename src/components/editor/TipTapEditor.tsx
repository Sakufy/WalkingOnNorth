"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "@/lib/editor-extensions";
import { sanitizePaste } from "@/lib/sanitize";
import { looksLikeMarkdown, markdownToWechatHTML } from "@/lib/markdown-to-wechat";
import EditorToolbar from "./EditorToolbar";
import { useCallback, useMemo } from "react";
import { DOMParser as PMDOMParser, Slice } from "@tiptap/pm/model";

interface Props {
  initialContent?: string;
  onChange?: (html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  disabled?: boolean;
}

export default function TipTapEditor({
  initialContent = "",
  onChange,
  onImageUpload,
  disabled = false,
}: Props) {
  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      const url = await onImageUpload(file);
      return url;
    },
    [onImageUpload]
  );

  const extensions = useMemo(() => editorExtensions, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "wechat-editor-content outline-none min-h-[60vh] px-8 py-6",
      },
      // knb.im HTML paste → sanitize → ProseMirror parses with StyleBlock
      transformPastedHTML(html) {
        return sanitizePaste(html);
      },
      // Plain text Markdown paste (knb.im raw copy)
      handlePaste(view, event) {
        const clipHtml = event.clipboardData?.getData("text/html");
        if (clipHtml) {
          // Has HTML → let transformPastedHTML handle it
          return false;
        }
        const text = event.clipboardData?.getData("text/plain");
        if (text && looksLikeMarkdown(text)) {
          event.preventDefault();
          const converted = markdownToWechatHTML(text);
          const dom = new DOMParser().parseFromString(converted, "text/html");
          const pmNode = PMDOMParser.fromSchema(view.state.schema).parse(dom.body);
          view.dispatch(
            view.state.tr.replaceSelection(new Slice(pmNode.content, 0, 0))
          );
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className="bg-background border border-border rounded-md overflow-hidden">
      <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} />
    </div>
  );
}
