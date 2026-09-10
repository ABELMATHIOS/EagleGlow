import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getAllTutorials } from '@/src/lib/tutorials';
import { getDisciplines } from '@/src/lib/disciplines';
import AdminSandaTutorials from '@/src/components/admin/AdminSandaTutorials';

const ADMIN_ROLES = ['admin', 'super_admin'];

export default async function AdminSandaTutorialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  if (!ADMIN_ROLES.includes(user.role)) redirect('/dashboard');

  const [allTutorials, disciplines] = await Promise.all([
    getAllTutorials(),
    getDisciplines(),
  ]);

  // Only discipline-tagged tutorials belong on this page — belt-tagged
  // (Wushu) tutorials are managed on the separate /admin/tutorials page.
  const sandaTutorials = allTutorials.filter((t) => Boolean(t.disciplineId));

  return <AdminSandaTutorials initialTutorials={sandaTutorials} disciplines={disciplines} />;
}