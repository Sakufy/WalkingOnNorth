"use client";

import { useEffect, useRef } from "react";

/** Pure-DOM scroll progress bar — zero React re-renders, zero jank */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;

    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const scrolled = el.scrollTop || document.body.scrollTop;
        const total = el.scrollHeight - el.clientHeight;
        const pct = total > 0 ? (scrolled / total) * 100 : 0;
        bar.style.width = `${pct}%`;
        bar.style.display = pct <= 0 ? "none" : "block";
        ticking = false;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: "0%",
        backgroundColor: "var(--bx-tertiary)",
        zIndex: 50,
        transition: "width 80ms linear",
        pointerEvents: "none",
      }}
    />
  );
}
