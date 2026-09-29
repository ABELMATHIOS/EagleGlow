import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';

async function isAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return false;
  const { data: profile } = await authClient
    .from('users').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' || profile?.role === 'super_admin';
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = createAdminClient();

  const { data: settings } = await admin
    .from('payment_settings')
    .select('school_code, video_url, instructions, updated_at')
    .limit(1).single();

  const { data: members, error: membersError } = await admin
    .from('users')
    .select('id, name, email, program, status, role')
    .not('role', 'in', '(admin,super_admin)')
    .not('status', 'in', '(pending,withdrawn)')
    .order('name', { ascending: true });

  if (membersError) {
    console.error('payment-codes members fetch failed:', membersError);
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  const { data: codes } = await admin
    .from('student_payment_codes')
    .select('user_id, student_code');
  const codeByUser = new Map((codes ?? []).map((c) => [c.user_id, c.student_code]));

  return NextResponse.json({
    settings: {
      schoolCode: settings?.school_code ?? '',
      videoUrl: settings?.video_url ?? '',
      instructions: settings?.instructions ?? '',
    },
    members: (members ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      program: m.program,
      studentCode: codeByUser.get(m.id) ?? '',
    })),
  });
}

type Body =
  | { type: 'settings'; schoolCode: string; videoUrl: string; instructions: string }
  | { type: 'student'; userId: string; studentCode: string };

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Body;
  const admin = createAdminClient();

  if (body.type === 'settings') {
    const { data: existing, error: findError } = await admin
      .from('payment_settings').select('id').limit(1).single();
    if (findError || !existing) {
      return NextResponse.json({ error: 'Settings row not found' }, { status: 500 });
    }
    const { error } = await admin
      .from('payment_settings')
      .update({
        school_code: String(body.schoolCode ?? '').trim(),
        video_url: String(body.videoUrl ?? '').trim(),
        instructions: String(body.instructions ?? ''),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.type === 'student') {
    const code = String(body.studentCode ?? '').trim();
    if (!body.userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    // Empty code = unassign
    if (code === '') {
      const { error } = await admin
        .from('student_payment_codes').delete().eq('user_id', body.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    const { error } = await admin
      .from('student_payment_codes')
      .upsert(
        { user_id: body.userId, student_code: code, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'That code is already assigned to another student' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}