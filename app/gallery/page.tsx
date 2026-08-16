import GalleryHero from "@/src/components/gallery/GalleryHero";
import GalleryGrid from "@/src/components/gallery/GalleryGrid";
import type { Metadata } from "next";
import { getPublishedAlbums } from "@/src/lib/gallery"; // ← adjust to the actual path of that file

export const dynamic = "force-dynamic"; // ensures fresh data on every request

export const metadata: Metadata = {
  title: "Gallery | EagleGlow",
  description: "Browse photos and videos from EagleGlow's graduations, competitions, and training sessions.",
  openGraph: {
    title: "Gallery | EagleGlow",
    description: "Photos and videos from graduations, competitions, and training.",
  },
};

export default async function GalleryPage() {
  const albums = await getPublishedAlbums();

  return (
    <>
      <GalleryHero />
      <GalleryGrid albums={albums} />
    </>
  );
}