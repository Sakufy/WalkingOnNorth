export default function Loading() {
  return (
    <div className="animate-pulse min-h-screen" style={{ background: "var(--bx-neutral)" }}>
      <div className="mx-auto max-w-4xl px-6 pt-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-8 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
          <div className="h-7 w-32 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.12 }} />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mb-3 rounded-xl p-4" style={{ background: "var(--bx-surface)" }}>
            <div className="mb-2 h-5 w-3/4 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
            <div className="h-4 w-1/2 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
