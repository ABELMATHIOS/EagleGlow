import { redirect } from 'next/navigation';
import Dashboard from '@/src/components/members/Dashboard';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getBelts } from '@/src/lib/belts';
import { getProgressSummary } from '@/src/lib/tutorial-progress';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard');
  }

  // If admin → send to admin page directly
  if (user.role === 'admin') {
    redirect('/admin');
  }

  // Fitness members don't have the real (Wushu) dashboard content yet —
  // send them to the dedicated Coming Soon page instead. Placed after the
  // admin check so an admin who happens to be tagged 'fitness' still lands
  // on /admin, not /dashboard/fitness.
  if (user.program === 'fitness') {
    redirect('/dashboard/fitness');
  }

  const belts = await getBelts();
  const lowestBeltOrder = Math.min(...belts.map((b) => b.order));
  const userBelt = belts.find((b) => b.id === user.beltId);
  const userBeltOrder = userBelt?.order ?? lowestBeltOrder;

  const progress = await getProgressSummary(userBeltOrder);

  return (
    <Dashboard
      user={{
        name: user.name,
        beltId: user.beltId,
        status: user.status,
        yearJoined: user.yearJoined,
        createdAt: user.createdAt,
      }}
      progress={progress}
      belts={belts}
    />
  );
}