import { createClient } from '@/src/lib/supabase/server';

export async function getHomeContent() {
  const supabase = await createClient();   // ← add await here
  const { data, error } = await supabase
    .from('home_content')
    .select('hero_video_url')
    .eq('id', '00000000-0000-0000-0000-000000000002')
    .single();

  if (error || !data) {
    console.error('Failed to fetch home_content:', error);
    return { heroVideoUrl: null as string | null };
  }

  return { heroVideoUrl: data.hero_video_url as string | null };
}