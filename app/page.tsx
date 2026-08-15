import HeroSection from "@/src/components/home/HeroSection";
import OurStory from "@/src/components/home/OurStory";
import OurMoments from "@/src/components/home/OurMoments";
import OurProgram from "@/src/components/home/OurProgram";
import SchedulePreview from "@/src/components/home/SchedulePreview";
import ContactPreview from "@/src/components/home/ContactPreview";
import { getClasses } from "@/src/lib/classes";
import { getHomeContent } from "@/src/lib/home-content";
import { getMomentPhotos } from "@/src/lib/gallery";
import { createClient } from "@/src/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [classes, home, momentPhotos, aboutResult] = await Promise.all([
    getClasses(),
    getHomeContent(),
    getMomentPhotos(4),
    supabase
      .from('about_content')
      .select('master_photo_url')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single(),
  ]);

  const masterPhotoUrl = aboutResult.data?.master_photo_url ?? null;

  return (
    <>
      <HeroSection videoUrl={home.heroVideoUrl} />
      <OurStory photoUrl={masterPhotoUrl} />
      <OurMoments photos={momentPhotos} />
      <OurProgram />
      <SchedulePreview classes={classes} />
      <ContactPreview />
    </>
  );
}