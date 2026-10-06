import { NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/admin';
import { requireAdmin, toAnnouncement, PROGRAMS } from '@/src/lib/announcements';

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, content, program, published } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }
  if (program != null && !PROGRAMS.includes(program)) {
    return NextResponse.json({ error: 'Invalid program' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('announcements')
    .insert({
      title: title.trim(),
      content: content.trim(),
      program: program ?? null,
      published: !!published,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toAnnouncement(data));
}