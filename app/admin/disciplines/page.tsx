import AdminDisciplines from '@/src/components/admin/AdminDisciplines';
import { getDisciplines } from '@/src/lib/disciplines';

export default async function AdminDisciplinesPage() {
  const disciplines = await getDisciplines();
  return <AdminDisciplines initialDisciplines={disciplines} />;
}