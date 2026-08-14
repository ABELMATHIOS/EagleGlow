import AdminOverview from '@/src/components/admin/AdminOverview';
import { getAllMembers } from '@/src/lib/get-all-members';
import { getBelts } from '@/src/lib/belts';

export default async function AdminPage() {
  const [members, belts] = await Promise.all([getAllMembers(), getBelts()]);
  return <AdminOverview members={members} belts={belts} />;
}