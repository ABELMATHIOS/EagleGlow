import HeroSection from "@/src/components/home/HeroSection";
import OurStory from "@/src/components/home/OurStory";
import OurMoments from "@/src/components/home/OurMoments";
import OurProgram from "@/src/components/home/OurProgram";
import SchedulePreview from "@/src/components/home/SchedulePreview";
import ContactPreview from "@/src/components/home/ContactPreview";
import { getClasses } from "@/src/lib/classes";
import { getHomeContent } from "@/src/lib/home-content";
import { getMomentPhotos } from "@/src/lib/gallery";
import { getAboutContent } from "@/src/lib/about-content";

export default async function Home() {
  const [classes, home, momentPhotos, about] = await Promise.all([
    getClasses(),
    getHomeContent(),
    getMomentPhotos(4),
    getAboutContent(),
  ]);

  return (
    <>
      <HeroSection videoUrl={home.heroVideoUrl} />
      <OurStory photoUrl={about.masterPhotoUrl} />
      <OurMoments photos={momentPhotos} />
      <OurProgram />
      <SchedulePreview classes={classes} />
      <ContactPreview />
    </>
  );
}