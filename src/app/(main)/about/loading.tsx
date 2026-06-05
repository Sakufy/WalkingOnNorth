export default function Loading() {
  return (
    <div className="animate-pulse min-h-screen" style={{ background: "var(--bx-neutral)" }}>
      <div className="mx-auto max-w-[720px] px-4 pt-16 pb-12">
        {/* Title skeleton */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-2 h-10 w-24 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
        </div>
        {/* Content skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <div className="mb-2 h-5 w-full rounded" style={{ background: "var(--bx-secondary)", opacity: 0.12 }} />
            <div className="mb-2 h-5 w-4/5 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
            <div className="h-5 w-2/3 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.06 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
