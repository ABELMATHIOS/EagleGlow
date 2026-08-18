export type YoutubeRef =
  | { type: 'video'; id: string }
  | { type: 'playlist'; id: string };

// Parses a pasted YouTube URL (or bare ID) into a normalized reference.
// Supports:
//  - Single video: watch?v=ID, youtu.be/ID, embed/ID, or a bare video ID
//  - Playlist: playlist?list=PLxxxx, or watch?v=ID&list=PLxxxx (playlist wins
//    when both a video and a list param are present, since the intent of
//    pasting a "watch?v=...&list=..." link is almost always "here's the
//    playlist", not "here's this one video").
export function parseYoutubeUrl(input: string): YoutubeRef | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch) {
    return { type: 'playlist', id: listMatch[1] };
  }

  const videoMatch = trimmed.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  if (videoMatch) {
    return { type: 'video', id: videoMatch[1] };
  }

  // Bare ID fallback — no recognizable URL pattern, assume it's a video ID
  // (matches the old behavior of allowing a raw pasted ID).
  if (/^[a-zA-Z0-9_-]{6,}$/.test(trimmed)) {
    return { type: 'video', id: trimmed };
  }

  return null;
}

// Canonical URL saved into tutorials.video_url — always reconstructable
// back into the same YoutubeRef by parseYoutubeUrl.
export function toCanonicalYoutubeUrl(ref: YoutubeRef): string {
  return ref.type === 'playlist'
    ? `https://www.youtube.com/playlist?list=${ref.id}`
    : `https://www.youtube.com/watch?v=${ref.id}`;
}

// Embed src for the iframe player — playlists use the videoseries embed
// endpoint, which autoplays through every item in order.
export function toYoutubeEmbedSrc(ref: YoutubeRef): string {
  return ref.type === 'playlist'
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${ref.id}`
    : `https://www.youtube-nocookie.com/embed/${ref.id}`;
}

// "Open on YouTube" link target.
export function toYoutubeWatchUrl(ref: YoutubeRef): string {
  return ref.type === 'playlist'
    ? `https://www.youtube.com/playlist?list=${ref.id}`
    : `https://www.youtube.com/watch?v=${ref.id}`;
}