export default function Loading() {
  return (
    <div className="animate-pulse min-h-screen" style={{ background: "var(--bx-neutral)" }}>
      <div className="mx-auto max-w-[720px] px-4 pt-16 pb-12">
        {/* Title */}
        <div className="mb-8">
          <div className="mx-auto mb-3 h-10 w-3/4 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
          <div className="mx-auto h-5 w-1/2 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
        </div>
        {/* Article body */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="mb-4">
            <div className="mb-2 h-5 w-full rounded" style={{ background: "var(--bx-secondary)", opacity: 0.12 }} />
            <div className="h-5 w-4/5 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
