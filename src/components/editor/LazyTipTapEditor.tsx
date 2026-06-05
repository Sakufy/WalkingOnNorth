"use client";

import { lazy, Suspense, type ComponentProps } from "react";
import type TipTapEditor from "./TipTapEditor";

const Editor = lazy(() => import("./TipTapEditor"));

export default function LazyTipTapEditor(
  props: ComponentProps<typeof TipTapEditor>
) {
  return (
    <Suspense
      fallback={
        <div
          className="animate-pulse flex items-center justify-center rounded-lg"
          style={{
            height: 400,
            background: "var(--bx-neutral)",
            color: "var(--bx-secondary)",
            fontSize: 15,
          }}
        >
          编辑器加载中...
        </div>
      }
    >
      <Editor {...props} />
    </Suspense>
  );
}
