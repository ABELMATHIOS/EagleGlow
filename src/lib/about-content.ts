import { createClient } from '@/src/lib/supabase/server';
import type { AboutContent } from '@/src/types';

const ABOUT_CONTENT_ID = '00000000-0000-0000-0000-000000000001';

// Single source of truth for reading about_content — was previously
// duplicated (with slightly different shapes) across app/about/page.tsx,
// app/api/about/route.ts, app/admin/about/page.tsx, and app/page.tsx.
// Any future column rename now only needs updating here.
export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .eq('id', ABOUT_CONTENT_ID)
    .single();

  if (error) {
    console.error('Failed to fetch about_content:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  return {
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
}
