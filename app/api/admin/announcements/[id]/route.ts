import { NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/admin';
import { requireAdmin, toAnnouncement, PROGRAMS } from '@/src/lib/announcements';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }
    update.title = body.title.trim();
  }
  if (body.content !== undefined) {
    if (!body.content.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    update.content = body.content.trim();
  }
  if (body.program !== undefined) {
    if (body.program !== null && !PROGRAMS.includes(body.program)) {
      return NextResponse.json({ error: 'Invalid program' }, { status: 400 });
    }
    update.program = body.program;
  }
  if (body.published !== undefined) update.published = !!body.published;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('announcements')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toAnnouncement(data));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from('announcements').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}