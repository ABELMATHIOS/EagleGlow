'use client';

import { createClient } from "@/src/lib/supabase/client";

// Writes directly to Supabase from the browser rather than going through an
// API route — safe here because tutorial_progress RLS policies restrict
// every read/write to auth.uid() = user_id, so a member can never touch
// another member's progress even with direct client access.

export async function markTutorialComplete(userId: string, tutorialId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tutorial_progress")
    .upsert({ user_id: userId, tutorial_id: tutorialId }, { onConflict: "user_id,tutorial_id" });
  if (error) throw new Error(error.message);
}

export async function markTutorialIncomplete(userId: string, tutorialId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tutorial_progress")
    .delete()
    .eq("user_id", userId)
    .eq("tutorial_id", tutorialId);
  if (error) throw new Error(error.message);
}