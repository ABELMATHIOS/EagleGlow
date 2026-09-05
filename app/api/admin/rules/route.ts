// app/api/admin/rules/route.ts
//
// Mirrors app/api/admin/about/route.ts: GET is available to any
// authenticated user (members need to read the rules too, not just
// admins), PATCH is admin-only and uses createAdminClient() (service
// role) since `rules` has no authenticated-write RLS policy — only
// "Anyone can read" was set up, matching what you ran earlier.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';

type RulesPatch = Partial<{
  title: string;
  content: string;
}>;

export async function GET() {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await authClient
    .from('rules')
    .select('id, title, content, updated_at')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('rules fetch failed:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch rules' }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
  });
}

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

  const body = (await req.json()) as RulesPatch;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.content === 'string') update.content = body.content;

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  // Rules has exactly one row (no fixed id like about_content's — the
  // table was created with a random gen_random_uuid() default). Fetch
  // that single row's id first so the update targets it precisely,
  // rather than an unscoped update that would touch every row if more
  // were ever added.
  const adminClient = createAdminClient();
  const { data: existing, error: findError } = await adminClient
    .from('rules')
    .select('id')
    .limit(1)
    .single();

  if (findError || !existing) {
    console.error('rules row lookup failed:', findError);
    return NextResponse.json({ error: 'Rules row not found' }, { status: 500 });
  }

  const { data, error } = await adminClient
    .from('rules')
    .update(update)
    .eq('id', existing.id)
    .select()
    .single();

  if (error || !data) {
    console.error('rules update failed:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update rules' }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
  });
}