import { redirect } from 'next/navigation';
import Dashboard from '@/src/components/members/Dashboard';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getBelts } from '@/src/lib/belts';
import { getProgressSummary } from '@/src/lib/tutorial-progress';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Belt-and-braces check — middleware already handles this redirect, but
  // this keeps the page safe to render even if it's ever reached directly.
  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard');
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
        createdAt: user.createdAt,
      }}
      progress={progress}
      belts={belts}
    />
  );
}