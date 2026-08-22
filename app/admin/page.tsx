// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getAllMembers } from '@/src/lib/get-all-members';
import { getBelts } from '@/src/lib/belts';
import AdminOverview from '@/src/components/admin/AdminOverview';

const ADMIN_ROLES = ['admin', 'super_admin'];

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  if (!ADMIN_ROLES.includes(user.role)) redirect('/dashboard');

  const [members, belts] = await Promise.all([
    getAllMembers(),
    getBelts(),
  ]);

  return <AdminOverview members={members} belts={belts} userName={user.name} />;
}