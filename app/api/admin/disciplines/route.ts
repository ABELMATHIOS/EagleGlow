// app/api/admin/disciplines/route.ts
//
// POST creates a new discipline. Follows the same admin-auth-then-service-
// role pattern as app/api/admin/rules/route.ts and app/api/admin/about/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';
async function requireAdmin() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  console.log('[disciplines POST debug] user:', user?.id, user?.email);

  if (!user) return null;

  const { data: profile, error: profileError } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('[disciplines POST debug] profile:', profile, 'error:', profileError);

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') return null;
  return user;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, order, description } = body as {
    name?: string;
    slug?: string;
    order?: number;
    description?: string;
  };

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('disciplines')
    .insert({ name, slug, order: order ?? 0, description: description ?? null })
    .select()
    .single();

  if (error || !data) {
    console.error('discipline create failed:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to create discipline' }, { status: 500 });
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