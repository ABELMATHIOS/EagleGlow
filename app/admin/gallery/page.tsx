import AdminGallery from '@/src/components/admin/AdminGallery';
import { getAllAlbums } from '@/src/lib/gallery'; // must be src/lib, not src/data

export default async function AdminGalleryPage() {
  const albums = await getAllAlbums();
  return <AdminGallery initialAlbums={albums} />;
}