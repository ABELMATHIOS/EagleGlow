import { GalleryAlbum } from "@/src/types";

// Mock data — replace with a Supabase query later (`gallery_albums` table).
// Single source of truth for gallery albums: previously duplicated between
// GalleryGrid.tsx (public page) and AdminGallery.tsx (admin panel) as two
// separate hardcoded arrays. Toggling `published` here is what the admin
// panel should control, and what the public page should now filter on.
export const ALBUMS: GalleryAlbum[] = [
  // ── Graduation ──
  {
    id:          'grad-2025',
    category:    'graduation',
    title:       '2025 / 2017 E.C.',
    subtitle:    'Graduation Ceremony',
    previews:    [
      '/images/gallery/graduation/2025/preview-1.JPG',
      '/images/gallery/graduation/2025/preview-2.JPG',
      '/images/gallery/graduation/2025/preview-3.JPG',
    ],
    albumUrl:    'https://photos.app.goo.gl/L35oJag8MJyQgn7y6',
    youtubeId:   'wFinxDBthng',
    videoOnly:   false,
    published: true,
  },
  {
    id:          'grad-2022',
    category:    'graduation',
    title:       '2022 / 2014 E.C.',
    subtitle:    'Graduation Ceremony',
    previews:    [],
    albumUrl:    null,
    youtubeId:   'iFuIOr0EC90',
    videoOnly:   true,
    published: true,
  },
  {
    id:          'grad-2023',
    category:    'graduation',
    title:       '2023 / 2015 E.C.',
    subtitle:    'Graduation Ceremony',
    previews:    [
      '/images/gallery/graduation/2023/preview-1.JPG',
      '/images/gallery/graduation/2023/preview-2.JPG',
      '/images/gallery/graduation/2023/preview-3.JPG',
    ],
    albumUrl:    'https://photos.app.goo.gl/XUqujfQ3ow4RsddZ6',
    youtubeId:   'srAi3LEefQg',
    videoOnly:   false,
    published: true,
  },
  {
    id:          'grad-2020',
    category:    'graduation',
    title:       '2020 / 2012 E.C.',
    subtitle:    'Graduation Ceremony',
    previews:    [
      '/images/gallery/graduation/2020/preview-1.JPG',
      '/images/gallery/graduation/2020/preview-2.JPG',
      '/images/gallery/graduation/2020/preview-3.JPG',
    ],
    albumUrl:    'https://photos.app.goo.gl/cY4y3zkN1wAYLHds5',
    youtubeId:   'PLACEHOLDER_YT_ID',
    videoOnly:   false,
    published: true,
  },
  {
    id:          'grad-2017',
    category:    'graduation',
    title:       '2017 / 2009 E.C.',
    subtitle:    'Graduation Ceremony',
    previews:    [
      '/images/gallery/graduation/2017/preview-1.JPG',
      '/images/gallery/graduation/2017/preview-2.JPG',
      '/images/gallery/graduation/2017/preview-3.JPG',
    ],
    albumUrl:    'https://photos.app.goo.gl/YFtG7NCTCJqubAyJ8',
    youtubeId:   null,
    videoOnly:   false,
    published: true,
  },

  // ── Competition ──
  {
    id:          'comp-2025',
    category:    'competition',
    title:       '2025 / 2017 E.C.',
    subtitle:    'Competition',
    previews:    [
      '/images/gallery/competition/2025/preview-1.jpg',
      '/images/gallery/competition/2025/preview-2.jpg',
      '/images/gallery/competition/2025/preview-3.jpg',
    ],
    albumUrl:    'https://photos.app.goo.gl/qAwkDtn6goCU7gxM8',
    youtubeId:   null,
    videoOnly:   false,
    published: true,
  },

  // ── Training ──
  {
    id:          'training',
    category:    'training',
    title:       'Training Memories & Moments',
    subtitle:    '2012 / 2004 E.C.',
    previews:    [
      '/images/gallery/training/preview-1.jpg',
      '/images/gallery/training/preview-2.jpg',
      '/images/gallery/training/preview-3.jpg'
    ],
    albumUrl:    'https://photos.app.goo.gl/EeQCBWB8gTDaYa6d9',
    youtubeId:   null,
    videoOnly:   false,
    published: true,
  },
];

export const getPublishedAlbums = () => ALBUMS.filter((a) => a.published);
export const getAlbumsByCategory = (category: GalleryAlbum["category"]) =>
  getPublishedAlbums().filter((a) => a.category === category);