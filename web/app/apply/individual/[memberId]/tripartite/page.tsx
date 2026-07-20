import { TripartiteForm } from './tripartite-form';

export default async function TripartitePage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  return <TripartiteForm memberId={memberId} />;
}
