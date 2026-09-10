import { createClient } from '@/src/lib/supabase/server';
import type { Discipline } from '@/src/types';

export type DisciplineWithCount = Discipline & { videoCount: number };

// Server-side only — used by the Sanda dashboard (discipline grid)
// and the admin Disciplines page. Fetches all disciplines ordered by
// their admin-set `order`, plus a published-video count per discipline so
// the dashboard grid can show "12 videos" or "Coming soon" per card.
export async function getDisciplines(): Promise<DisciplineWithCount[]> {
  const supabase = await createClient();

  const { data: disciplines, error } = await supabase
    .from('disciplines')
    .select('id, name, slug, order, description, created_at')
    .order('order', { ascending: true });

  if (error || !disciplines) {
    console.error('getDisciplines failed:', error);
    throw error ?? new Error('Disciplines not found');
  }

  // Separate count query rather than a nested aggregate — keeps this
  // resilient to RLS on tutorials without needing a Postgres function.
  const { data: tutorialCounts, error: countError } = await supabase
    .from('tutorials')
    .select('discipline_id')
    .eq('published', true)
    .not('discipline_id', 'is', null);

  if (countError) {
    console.error('getDisciplines tutorial count fetch failed:', countError);
  }

  const counts = new Map<string, number>();
  for (const row of tutorialCounts ?? []) {
    const id = row.discipline_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return disciplines.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    order: d.order,
    description: d.description ?? undefined,
    createdAt: d.created_at,
    videoCount: counts.get(d.id) ?? 0,
  }));
}