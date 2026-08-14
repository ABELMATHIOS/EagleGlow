import TutorialDetail from '@/src/components/members/TutorialDetail';
import { getPublishedTutorials } from '@/src/lib/tutorials';

export default async function TutorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorials = await getPublishedTutorials();
  return <TutorialDetail belt={slug} tutorials={tutorials} />;
}