export default function Loading() {
  return (
    <div className="animate-pulse min-h-screen" style={{ background: "var(--bx-neutral)" }}>
      <div className="mx-auto max-w-[760px] px-4 pt-16 pb-12">
        {/* Section title */}
        <div className="mb-6">
          <div className="mx-auto mb-2 h-10 w-28 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
        </div>
        {/* Post list */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 rounded-2xl p-5" style={{ background: "var(--bx-surface)" }}>
            <div className="mb-2 h-5 w-full rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
            <div className="mb-3 h-4 w-4/5 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
            <div className="flex gap-3">
              <div className="h-4 w-14 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.12 }} />
              <div className="h-4 w-16 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
