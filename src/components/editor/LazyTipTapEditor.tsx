"use client";

import dynamic from "next/dynamic";
import { type ComponentProps } from "react";
import type TipTapEditor from "./TipTapEditor";

const Editor = dynamic(() => import("./TipTapEditor"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        height: 400,
        background: "var(--bx-neutral)",
        color: "var(--bx-secondary)",
        fontSize: 15,
      }}
    >
      <div className="animate-pulse">编辑器加载中...</div>
    </div>
  ),
});

export default function LazyTipTapEditor(
  props: ComponentProps<typeof TipTapEditor>
) {
  return <Editor {...props} />;
}
