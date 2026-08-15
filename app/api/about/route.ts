// app/api/about/route.ts
//
// Public, unauthenticated read — the About Us page (guest-facing) fetches
// from here. RLS allows anon select on about_content, so the normal
// (non-admin) Supabase client is fine here — no createAdminClient() needed.

import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server'; // adjust to your actual server-client helper path

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to load About Us content' }, { status: 500 });
  }

  return NextResponse.json({
    ourStory: data.our_story,
    ourVision: data.our_vision,
    ourMission: data.our_mission,
    ourGoal: data.our_goal,
    masterName: data.master_name,
    masterTitle: data.master_title,
    masterBio: data.master_bio,
    quoteText: data.quote_text,
    quoteAuthor: data.quote_author,
    masterPhotoUrl: data.master_photo_url,
    certificates: data.certificates ?? [],
    updatedAt: data.updated_at,
  });
}