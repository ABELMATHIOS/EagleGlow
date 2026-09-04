import { redirect } from 'next/navigation';
import FitnessDashboard from '@/src/components/members/FitnessDashboard';
import { getCurrentUser } from '@/src/lib/get-current-user';

export default async function FitnessDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/fitness');
  }

  // A Wushu member landing here directly (typed URL, old bookmark, etc.)
  // should just go to their real dashboard instead of seeing this.
  if (user.program !== 'fitness') {
    redirect('/dashboard');
  }

  return (
    <FitnessDashboard
      user={{
        name: user.name,
        status: user.status,
        createdAt: user.createdAt,
      }}
    />
  );
}