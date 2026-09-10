// app/api/admin/disciplines/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';

async function requireAdmin() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return null;

  const { data: profile } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') return null;
  return user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  const body = await req.json();
  const { name, slug, order, description } = body as {
    name?: string;
    slug?: string;
    order?: number;
    description?: string;
  };

  const update: Record<string, unknown> = {};
  if (typeof name === 'string') update.name = name;
  if (typeof slug === 'string') update.slug = slug;
  if (typeof order === 'number') update.order = order;
  if (typeof description === 'string') update.description = description;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('disciplines')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('discipline update failed:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update discipline' }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    slug: data.slug,
    order: data.order,
    description: data.description ?? undefined,
    createdAt: data.created_at,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  // Deleting a discipline cascades to its tutorials (see
  // discipline_id ... on delete cascade in the migration) — any videos
  // tagged to this discipline are removed too, not just the discipline row.
  const supabase = createAdminClient();
  const { error } = await supabase.from('disciplines').delete().eq('id', id);

  if (error) {
    console.error('discipline delete failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}