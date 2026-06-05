export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-8 text-text-secondary">文章详情 {id} —— Phase 05</div>
  );
}
