import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getDisciplines } from '@/src/lib/disciplines';
import { getPublishedTutorialsByDiscipline } from '@/src/lib/tutorials';
import SandaDisciplineTutorials from '@/src/components/members/SandaDisciplineTutorials';

export default async function SandaDisciplinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?redirectTo=/dashboard/sanda/disciplines/${slug}`);
  }

  if (user.program !== 'sanda') {
    redirect('/dashboard');
  }

  const disciplines = await getDisciplines();
  const discipline = disciplines.find((d) => d.slug === slug);

  if (!discipline) {
    notFound();
  }

    const tutorials = await getPublishedTutorialsByDiscipline(discipline.id);
  return <SandaDisciplineTutorials discipline={discipline} tutorials={tutorials} />;
}