import TutorialDetail from '@/src/components/members/TutorialDetail';
import { getPublishedTutorials } from '@/src/lib/tutorials';
import { getBelts } from '@/src/lib/belts';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getUserProgress } from '@/src/lib/tutorial-progress';
import { redirect } from 'next/navigation';

export default async function TutorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [tutorials, belts, currentUser, completedIds] = await Promise.all([
    getPublishedTutorials(),
    getBelts(),
    getCurrentUser(),
    getUserProgress(),
  ]);

  const requestedBelt = belts.find((b) => b.slug === slug);
  const userBelt = belts.find((b) => b.id === currentUser?.beltId);
  const lowestBeltOrder = Math.min(...belts.map((b) => b.order));
  const userBeltOrder = userBelt?.order ?? lowestBeltOrder;

  // Block access to any belt above the member's current level.
  if (requestedBelt && requestedBelt.order > userBeltOrder) {
    redirect('/tutorials');
  }

  return (
    <TutorialDetail
      belt={slug}
      belts={belts}
      tutorials={tutorials}
      currentUserId={currentUser?.id ?? null}
      completedTutorialIds={Array.from(completedIds)}
    />
  );
}