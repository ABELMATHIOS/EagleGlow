import Register from '@/src/components/auth/Register';
import { getBelts } from '@/src/lib/belts';

export default async function RegisterPage() {
  const belts = await getBelts();
  const beltNames = belts.map((b) => b.name);
  return <Register beltOptions={beltNames} />;
}