import { createClient } from "@/src/lib/supabase/server";
import type { Belt } from "@/src/types";

type BeltRow = {
  id: string;
  name: string;
  slug: string;
  color: string;
  text_color: string;
  shadow: string;
  border: string | null;
  sort_order: number;
  description: string;
};

function toBelt(row: BeltRow): Belt {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    textColor: row.text_color,
    shadow: row.shadow,
    border: row.border ?? undefined,
    order: row.sort_order,
    description: row.description,
  };
}

export async function getBelts(): Promise<Belt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("belts")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as BeltRow[]).map(toBelt);
}