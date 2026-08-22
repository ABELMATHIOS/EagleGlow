// app/api/admin/home/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';

type HomeContentPatch = Partial<{
  heroVideoUrl: string | null;
}>;

const FIELD_MAP: Record<keyof HomeContentPatch, string> = {
  heroVideoUrl: 'hero_video_url',
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

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as HomeContentPatch;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body) as (keyof HomeContentPatch)[]) {
    if (!(key in FIELD_MAP)) continue;
    update[FIELD_MAP[key]] = body[key];
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('home_content')
    .update(update)
    .eq('id', '00000000-0000-0000-0000-000000000002')
    .select()
    .single();

  if (error || !data) {
    console.error('home_content update failed:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update Home content' }, { status: 500 });
  }

  return NextResponse.json({
    heroVideoUrl: data.hero_video_url,
    updatedAt: data.updated_at,
  });
}