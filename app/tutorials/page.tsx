import TutorialsIndex from '@/src/components/members/TutorialsIndex';
import { getPublishedTutorials } from '@/src/lib/tutorials';
import { getBelts } from '@/src/lib/belts';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getUserProgress } from '@/src/lib/tutorial-progress';

export const metadata = {
  title: 'Tutorials | EagleGlow Wushu & Fitness Center',
  description: 'Access your belt training tutorials and track your progress.',
};

export default async function TutorialsPage() {
  const [tutorials, belts, currentUser, completedIds] = await Promise.all([
    getPublishedTutorials(),
    getBelts(),
    getCurrentUser(),
    getUserProgress(),
  ]);

  const userBelt = belts.find((b) => b.id === currentUser?.beltId);
  const lowestBeltOrder = Math.min(...belts.map((b) => b.order));
  const userBeltOrder = userBelt?.order ?? lowestBeltOrder;

  return (
    <TutorialsIndex
      tutorials={tutorials}
      belts={belts}
      userBeltOrder={userBeltOrder}
      completedTutorialIds={Array.from(completedIds)}
    />
  );
}