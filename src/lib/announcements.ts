import { createClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';
import type { Announcement, Program } from '@/src/types';

export const PROGRAMS: Program[] = ['wushu', 'fitness', 'sanda'];

type Row = {
  id: string;
  title: string;
  content: string;
  program: Program | null;
  published: boolean;
  created_at: string;
};

export const toAnnouncement = (r: Row): Announcement => ({
  id: r.id,
  title: r.title,
  content: r.content,
  program: r.program,
  published: r.published,
  createdAt: r.created_at,
});

// Member-facing: published + (all programs OR this member's program)
export async function getPublishedAnnouncements(program: Program): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('published', true)
    .or(`program.is.null,program.eq.${program}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getPublishedAnnouncements failed:', error);
    return [];
  }
  return (data as Row[]).map(toAnnouncement);
}

// Admin-facing: everything, including drafts
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(toAnnouncement);
}

// Same pattern as your status/belt routes: RLS-scoped client verifies the caller
export async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: me } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  return !!me && (me.role === 'admin' || me.role === 'super_admin');
}