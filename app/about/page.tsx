// app/about/page.tsx
//
// Server component — fetches the singleton about_content row once and
// passes it down as props, same pattern as app/admin/about/page.tsx.

import type { Metadata } from 'next';
import AboutHero from '@/src/components/about/AboutHero';
import OurStory from '@/src/components/about/OurStory';
import OurVisionMissionGoal from '@/src/components/about/OurVisionMissionGoal';
import MeetOurMaster from '@/src/components/about/MeetOurMaster';
import CertificatesRecognition from '@/src/components/about/CertificatesRecognition';
import { getAboutContent } from '@/src/lib/about-content';

export const metadata: Metadata = {
  title: 'About Us | EagleGlow',
  description: 'Learn about EagleGlow\'s story, our vision and mission, meet our Master, and see our certificates and recognitions.',
  openGraph: {
    title: 'About Us | EagleGlow',
    description: 'Our story, our vision and mission, and the master behind EagleGlow.',
  },
};

export default async function AboutPage() {
  const content = await getAboutContent();

  return (
    <>
      <AboutHero />
      <OurStory content={content} />
      <OurVisionMissionGoal content={content} />
      <MeetOurMaster content={content} />
      <CertificatesRecognition content={content} />
    </>
  );
}