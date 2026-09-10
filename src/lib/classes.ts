import { createClient } from "@/src/lib/supabase/server";
import type { ClassSchedule } from "@/src/types";

type ClassRow = {
  id: string;
  day: string;
  time: string;
  end_time: string;
  title: string;
  type: ClassSchedule["type"];
  location: string;
  level: string | null;
  instructor: string | null;
  created_at: string;
  tag: string | null;
};
function toClass(row: ClassRow): ClassSchedule {
  return {
    id: row.id,
    day: row.day,
    time: row.time,
    endTime: row.end_time,
    title: row.title,
    type: row.type,
    location: row.location ?? 'Yerer Gullit',
    level: row.level ?? undefined,
    instructor: row.instructor ?? undefined,
    tag: (row.tag as ClassSchedule["tag"]) ?? undefined,
  };
}

// No published/draft split — every class in the table is visible to
// everyone. Used both by the public schedule pages and the admin page.
export async function getClasses(): Promise<ClassSchedule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("day", { ascending: true })
    .order("time", { ascending: true });

  if (error) throw error;
  return (data as ClassRow[]).map(toClass);
}