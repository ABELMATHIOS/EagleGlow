'use client';

import { createClient } from '@/src/lib/supabase/client';

// Modern phone cameras produce very large photos (often 8-15MB+). Uploading
// one of those directly over a slow mobile connection can take so long it
// looks completely frozen — no error, just an endless spinner. This resizes
// and compresses the image in the browser BEFORE upload, so even a huge
// original becomes a small file (typically under ~500KB) almost instantly,
// regardless of the person's phone or connection speed.
async function compressImage(file: File, maxDimension = 1200, quality = 0.82): Promise<File> {
  // Only compress actual images — anything else (shouldn't happen given
  // the <input accept="image/*">, but be safe) passes through untouched.
  if (!file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  // If the browser can't decode it (e.g. an unsupported HEIC variant on
  // some Android browsers), fall back to uploading the original rather
  // than failing outright — Supabase itself has no format restriction.
  if (!bitmap) return file;

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  if (!blob) return file;

  // Only use the compressed version if it's actually smaller — for an
  // already-small image, compression can occasionally add overhead.
  if (blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

// Uploads one image to the avatars bucket, under a folder matching the
// signed-in user's own id — required by the storage RLS policies, which
// only allow a user to write into their own folder. Returns the public URL.
export async function uploadProfilePhoto(file: File): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not signed in');

  const uploadFile = await compressImage(file);
  const ext = uploadFile.name.split('.').pop();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(path, uploadFile);
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