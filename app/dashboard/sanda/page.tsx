import { redirect } from 'next/navigation';
import SandaDashboard from '@/src/components/members/SandaDashboard';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getDisciplines } from '@/src/lib/disciplines';

export default async function SandaDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/sanda');
  }

  // Anyone landing here who isn't Sanda gets sent to their real
  // dashboard, same guard pattern as the Fitness dashboard.
  if (user.program !== 'sanda') {
    redirect('/dashboard');
  }

  const disciplines = await getDisciplines();

  return (
    <SandaDashboard
      user={{
        name: user.name,
        status: user.status,
        createdAt: user.createdAt,
      }}
      disciplines={disciplines}
    />
  );
}