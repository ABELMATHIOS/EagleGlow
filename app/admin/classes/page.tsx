import AdminClasses from '@/src/components/admin/AdminClasses';
import { getClasses } from '@/src/lib/classes';

export default async function AdminClassespage() {
  const classes = await getClasses();
  return <AdminClasses initialClasses={classes} />;
}