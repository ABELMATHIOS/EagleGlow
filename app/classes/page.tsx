import ClassesHero from '@/src/components/classes/ClassesHero';
import OurClasses from '@/src/components/classes/OurClasses';
import WhatToBring from '@/src/components/classes/WhatToBring';
import WeeklySchedule from '@/src/components/classes/WeeklySchedule';
import ClassesCTA from '@/src/components/classes/ClassesCTA';
import { getClasses } from '@/src/lib/classes';

export const dynamic = 'force-dynamic'; // always reflect latest admin edits

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <>
      <ClassesHero />
      <OurClasses />
      <WhatToBring />
      <WeeklySchedule classes={classes} />
      <ClassesCTA />
    </>
  );
}