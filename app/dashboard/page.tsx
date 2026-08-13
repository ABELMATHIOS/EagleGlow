import { redirect } from 'next/navigation';
import Dashboard from '@/src/components/members/Dashboard';
import { getCurrentUser } from '@/src/lib/get-current-user';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Belt-and-braces check — middleware already handles this redirect, but
  // this keeps the page safe to render even if it's ever reached directly.
  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard');
  }

  return (
    <Dashboard
      user={{
        name: user.name,
        beltId: user.beltId,
        status: user.status,
        createdAt: user.createdAt,
      }}
    />
  );
}