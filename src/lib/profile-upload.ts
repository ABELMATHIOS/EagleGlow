'use client';

import { createClient } from '@/src/lib/supabase/client';

// Uploads one image to the avatars bucket, under a folder matching the
// signed-in user's own id — required by the storage RLS policies, which
// only allow a user to write into their own folder. Returns the public URL.
export async function uploadProfilePhoto(file: File): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not signed in');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

// Deletes one avatar from storage given its public URL. No-op if the URL
// doesn't look like an avatars bucket URL, so callers don't need to guard.
export async function deleteProfilePhoto(url: string): Promise<void> {
  const marker = '/avatars/';
  const idx = url.indexOf(marker);
  if (idx === -1) return;

  const supabase = createClient();
  const path = decodeURIComponent(url.slice(idx + marker.length));

  const { error } = await supabase.storage.from('avatars').remove([path]);
  if (error) throw new Error(error.message);
}
