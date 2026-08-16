// app/api/about/route.ts
//
// Public, unauthenticated read — the About Us page (guest-facing) fetches
// from here. RLS allows anon select on about_content, so the normal
// (non-admin) Supabase client is fine here — no createAdminClient() needed.

import { NextResponse } from 'next/server';
import { getAboutContent } from '@/src/lib/about-content';

export async function GET() {
  const content = await getAboutContent();
  return NextResponse.json(content);
}