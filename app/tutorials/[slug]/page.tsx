import TutorialDetail from '@/src/components/members/TutorialDetail';
export default async function TutorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TutorialDetail belt={slug} />;
}