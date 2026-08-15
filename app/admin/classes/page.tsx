import AdminClasses from '@/src/components/admin/AdminClasses';
import { getClasses } from '@/src/lib/classes'; // adjust to the actual path of that file

export default async function AdminClassesPage() {
  const classes = await getClasses();
  return <AdminClasses initialClasses={classes} />;
}