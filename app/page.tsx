import HeroSection from "@/src/components/home/HeroSection";
import OurStory from "@/src/components/home/OurStory";
import OurMoments from "@/src/components/home/OurMoments";
import OurProgram from "@/src/components/home/OurProgram";
import SchedulePreview from "@/src/components/home/SchedulePreview";
import ContactPreview from "@/src/components/home/ContactPreview";

export default function Home() {
  return (
    <>
      <HeroSection />
      <OurStory />
      <OurMoments />
      <OurProgram />
      <SchedulePreview />
      <ContactPreview />
    </>
  );
}