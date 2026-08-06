import AboutHero from '@/src/components/about/AboutHero';
import OurStory from '@/src/components/about/OurStory';
import OurVisionMissionGoal from '@/src/components/about/OurVisionMissionGoal';
import MeetOurMaster from '@/src/components/about/MeetOurMaster';
import CertificatesRecognition from '@/src/components/about/CertificatesRecognition';

export const metadata = {
  title: 'About Us | EagleGlow Wushu & Fitness Center',
  description: 'Learn about EagleGlow Wushu & Fitness Center — founded in 2002 by Master Endale Melse in Addis Ababa. Our story, vision, mission, and team.',
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <OurStory />
      <OurVisionMissionGoal />
      <MeetOurMaster />
      <CertificatesRecognition />
    </main>
  );
}