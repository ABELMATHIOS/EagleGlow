"use client";

import { createClient } from "@/src/lib/supabase/client";

// Uploads one image to the gallery-previews bucket and returns its public
// URL. Called immediately when an admin picks a file in the Add/Edit Album
// form — before the album itself is saved.
export async function uploadGalleryPhoto(file: File, category: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${category}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("gallery-previews").upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("gallery-previews").getPublicUrl(path);
  return data.publicUrl;
}

// Deletes one or more gallery preview photos from storage, given their
// public URLs (as stored in album.previews). Safe to call with an empty
// array. Used when an album is deleted (or a preview is replaced/removed)
// so files don't pile up as orphans in the bucket.
export async function deleteGalleryPhotos(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const supabase = createClient();

  const paths = urls
    .map((url) => {
      const marker = "/gallery-previews/";
      const idx = url.indexOf(marker);
      return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length));
    })
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from("gallery-previews").remove(paths);
  if (error) throw new Error(error.message);
}