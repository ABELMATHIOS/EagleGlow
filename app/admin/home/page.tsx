// app/admin/home/page.tsx
import AdminHome from '@/src/components/admin/AdminHome';
import { createClient } from '@/src/lib/supabase/server';

export default async function AdminHomePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('home_content')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000002')
    .single();

  const initialContent = {
    heroVideoUrl: data?.hero_video_url ?? null,
  };

  return <AdminHome initialContent={initialContent} />;
}