import AdminAnnouncements from '@/src/components/admin/AdminAnnouncements';
import { getAllAnnouncements } from '@/src/lib/announcements';

export default async function AdminAnnouncementsPage() {
  const items = await getAllAnnouncements();
  return <AdminAnnouncements initialItems={items} />;
}