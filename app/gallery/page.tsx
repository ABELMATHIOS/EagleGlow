import GalleryHero from "@/src/components/gallery/GalleryHero";
import GalleryGrid from "@/src/components/gallery/GalleryGrid";
import { getPublishedAlbums } from "@/src/lib/gallery"; // ← adjust to the actual path of that file

export const dynamic = "force-dynamic"; // ensures fresh data on every request

export default async function GalleryPage() {
  const albums = await getPublishedAlbums();

  return (
    <>
      <GalleryHero />
      <GalleryGrid albums={albums} />
    </>
  );
}