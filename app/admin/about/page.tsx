// app/admin/about/page.tsx
//
// Server component — mirrors how AdminMembers gets its data (fetched
// server-side, passed down as props to a 'use client' editor component).

import AdminAbout from '@/src/components/admin/AdminAbout';
import { getAboutContent } from '@/src/lib/about-content';

export default async function AdminAboutPage() {
  const initialContent = await getAboutContent();
  return <AdminAbout initialContent={initialContent} />;
}