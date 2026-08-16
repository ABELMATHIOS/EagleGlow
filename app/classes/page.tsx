import ClassesHero from '@/src/components/classes/ClassesHero';
import OurClasses from '@/src/components/classes/OurClasses';
import WhatToBring from '@/src/components/classes/WhatToBring';
import WeeklySchedule from '@/src/components/classes/WeeklySchedule';
import ClassesCTA from '@/src/components/classes/ClassesCTA';
import type { Metadata } from 'next';
import { getClasses } from '@/src/lib/classes';

export const dynamic = 'force-dynamic'; // always reflect latest admin edits

export const metadata: Metadata = {
  title: 'Classes & Schedule | EagleGlow',
  description: 'Explore our Wushu and fitness classes, view the weekly schedule, and find out what to bring to your first session.',
  openGraph: {
    title: 'Classes & Schedule | EagleGlow',
    description: 'Wushu and fitness classes, weekly schedule, and what to bring.',
  },
};

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