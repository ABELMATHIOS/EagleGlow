import { createClient } from '@/src/lib/supabase/server';

export type RulesContent = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

// Server-side only — used by both /dashboard/rules (member view) and
// /admin/rules (admin edit view). Do NOT import updateRules() here; that
// lives in admin-action.ts since it's called from client components
// (AdminRules.tsx) and must not pull in this file's next/headers-dependent
// createClient import.
export async function getRules(): Promise<RulesContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rules')
    .select('id, title, content, updated_at')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('getRules failed:', error);
    throw error ?? new Error('Rules not found');
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
  };
}