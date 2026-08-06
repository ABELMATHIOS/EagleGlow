'use client';

import ClassesHero from '@/src/components/classes/ClassesHero';
import OurClasses from '@/src/components/classes/OurClasses';
import WhatToBring from '@/src/components/classes/WhatToBring';
import WeeklySchedule from '@/src/components/classes/WeeklySchedule';
import ClassesCTA from '@/src/components/classes/ClassesCTA';

export default function ClassesPage() {
  return (
    <>
      <ClassesHero />
      <OurClasses />
      <WhatToBring />
      <WeeklySchedule />
      <ClassesCTA />
    </>
  );
}