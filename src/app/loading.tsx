export default function Loading() {
  return (
    <div className="animate-pulse min-h-screen" style={{ background: "var(--bx-neutral)" }}>
      {/* Hero skeleton */}
      <div className="mx-auto max-w-[800px] px-4 pt-16 pb-12 text-center">
        <div className="mx-auto mb-6 h-8 w-48 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.2 }} />
        <div className="mx-auto mb-4 h-12 w-72 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
        <div className="mx-auto h-5 w-96 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.1 }} />
      </div>
      {/* Section cards skeleton */}
      <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-6 px-4 pb-12 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-6" style={{ background: "var(--bx-surface)" }}>
            <div className="mb-4 h-6 w-20 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.2 }} />
            <div className="mb-2 h-5 w-full rounded" style={{ background: "var(--bx-secondary)", opacity: 0.12 }} />
            <div className="h-4 w-3/4 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
          </div>
        ))}
      </div>
      {/* Featured posts skeleton */}
      <div className="mx-auto max-w-[800px] px-4 pb-16">
        <div className="mb-4 h-7 w-32 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.2 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 rounded-2xl p-5" style={{ background: "var(--bx-surface)" }}>
            <div className="mb-2 h-5 w-full rounded" style={{ background: "var(--bx-secondary)", opacity: 0.15 }} />
            <div className="h-4 w-48 rounded" style={{ background: "var(--bx-secondary)", opacity: 0.08 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
