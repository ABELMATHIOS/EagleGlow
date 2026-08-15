// app/admin/about/page.tsx
//
// Server component — mirrors how AdminMembers gets its data (fetched
// server-side, passed down as props to a 'use client' editor component).

import AdminAbout from '@/src/components/admin/AdminAbout';
import { createClient } from '@/src/lib/supabase/server'; // adjust to your actual server-client helper path

export default async function AdminAboutPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('about_content')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  const initialContent = {
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

  return <AdminAbout initialContent={initialContent} />;
}