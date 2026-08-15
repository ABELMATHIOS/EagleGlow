// app/api/admin/about/route.ts
//
// Admin-only update. Follows the same shape as
// app/api/admin/users/[id]/name-correction/route.ts: verify the caller is
// an authenticated admin, then use createAdminClient() (service role) for
// the actual write since about_content has no authenticated-write RLS
// policy at all — only the service-role key can write to it.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server'; // server-side client — reads the session via cookies, same as elsewhere
import { createAdminClient } from '@/src/lib/supabase/admin'; // same helper name-correction route already uses

type Certificate = { id: string; url: string; caption: string };

type AboutContentPatch = Partial<{
  ourStory: string;
  ourVision: string;
  ourMission: string;
  ourGoal: string;
  masterName: string;
  masterTitle: string;
  masterBio: string;
  quoteText: string;
  quoteAuthor: string;
  masterPhotoUrl: string | null;
  certificates: Certificate[];
}>;

// camelCase (client) -> snake_case (db)
const FIELD_MAP: Record<keyof AboutContentPatch, string> = {
  ourStory: 'our_story',
  ourVision: 'our_vision',
  ourMission: 'our_mission',
  ourGoal: 'our_goal',
  masterName: 'master_name',
  masterTitle: 'master_title',
  masterBio: 'master_bio',
  quoteText: 'quote_text',
  quoteAuthor: 'quote_author',
  masterPhotoUrl: 'master_photo_url',
  certificates: 'certificates',
};

export async function PATCH(req: NextRequest) {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as AboutContentPatch;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body) as (keyof AboutContentPatch)[]) {
    if (!(key in FIELD_MAP)) continue;
    update[FIELD_MAP[key]] = body[key];
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('about_content')
    .update(update)
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .select()
    .single();

  if (error || !data) {
  console.error('about_content update failed:', error);
  return NextResponse.json({ error: error?.message ?? 'Failed to update About Us content' }, { status: 500 });
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