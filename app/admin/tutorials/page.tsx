import AdminTutorials from '@/src/components/admin/AdminTutorials';
import { getAllTutorials } from '@/src/lib/tutorials';
import { getBelts } from '@/src/lib/belts';

export default async function AdminTutorialsPage() {
  const [tutorials, belts] = await Promise.all([getAllTutorials(), getBelts()]);
  return <AdminTutorials initialTutorials={tutorials} belts={belts} />;
}