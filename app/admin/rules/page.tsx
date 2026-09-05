import AdminRules from '@/src/components/admin/AdminRules';
import { getRules } from '@/src/lib/rules';

export default async function AdminRulesPage() {
  const rules = await getRules();
  return <AdminRules initialContent={rules} />;
}