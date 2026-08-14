import { redirect } from 'next/navigation';
import Pending from '@/src/components/auth/Pending';
import { getCurrentUser } from '@/src/lib/get-current-user';

export default async function PendingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  // If they've since been approved, don't show them a stale gate screen.
  if (user.status === 'active' || user.role === 'admin') {
    redirect('/dashboard');
  }

  return <Pending status={user.status} />;
}