"use client";

import { createClient } from "@/src/lib/supabase/client";

// Uploads one image to the about-content bucket and returns its public
// URL. Used for the Master photo (single) and certificate photos (up to
// however many the admin adds) in the About editor.
export async function uploadAboutPhoto(
  file: File,
  folder: "master" | "certificates" | "hero"
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("about-content").upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("about-content").getPublicUrl(path);
  return data.publicUrl;
}

// Deletes one or more About images from storage, given their public URLs.
// Safe to call with an empty array. Used when a photo is replaced/removed
// so files don't pile up as orphans in the bucket.
export async function deleteAboutPhotos(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const supabase = createClient();

  const paths = urls
    .map((url) => {
      const marker = "/about-content/";
      const idx = url.indexOf(marker);
      return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length));
    })
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from("about-content").remove(paths);
  if (error) throw new Error(error.message);
}