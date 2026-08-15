// app/about/page.tsx
//
// Server component — fetches the singleton about_content row once and
// passes it down as props, same pattern as app/admin/about/page.tsx.

import OurStory from '@/src/components/about/OurStory';
import OurVisionMissionGoal from '@/src/components/about/OurVisionMissionGoal';
import MeetOurMaster from '@/src/components/about/MeetOurMaster';
import CertificatesRecognition from '@/src/components/about/CertificatesRecognition';
import { createClient } from '@/src/lib/supabase/server'; // adjust to your actual server-client helper path
import type { AboutContent } from '@/src/types';

export default async function AboutPage() {
  const supabase = await createClient();

 const { data, error } = await supabase
  .from('about_content')
  .select('*')
  .eq('id', '00000000-0000-0000-0000-000000000001')
  .single();

if (error) {
  console.error('Failed to fetch about_content:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

  const content: AboutContent = {
    ourStory: data?.our_story ?? '',
    ourVision: data?.our_vision ?? '',
    ourMission: data?.our_mission ?? '',
    ourGoal: data?.our_goal ?? '',
    masterName: data?.master_name ?? '',
    masterTitle: data?.master_title ?? '',
    masterBio: data?.master_bio ?? '',
    quoteText: data?.quote_text ?? '',
    quoteAuthor: data?.quote_author ?? '',
    masterPhotoUrl: data?.master_photo_url ?? null,
    certificates: data?.certificates ?? [],
    updatedAt: data?.updated_at ?? '',
  };

  return (
    <>
      {/* existing hero banner / other sections stay as-is */}
      <OurStory content={content} />
      <OurVisionMissionGoal content={content} />
      <MeetOurMaster content={content} />
      <CertificatesRecognition content={content} />
    </>
  );
}