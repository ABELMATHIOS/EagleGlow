// app/admin/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getAllMembers } from '@/src/lib/get-all-members';
import { getAllAlbums } from '@/src/lib/gallery';
import { getBelts } from '@/src/lib/belts';
import { getClasses } from '@/src/lib/classes';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const [members, albums, belts, classes] = await Promise.all([
    getAllMembers(),
    getAllAlbums(),
    getBelts(),
    getClasses(),
  ]);

  const sections = [
    { title: 'Home', href: '/admin/home', description: 'Hero video & home page content' },
    { title: 'About', href: '/admin/about', description: 'About page content' },
    { title: 'Members', href: '/admin/members', description: `${members.length} member${members.length === 1 ? '' : 's'}` },
    { title: 'Gallery', href: '/admin/gallery', description: `${albums.length} album${albums.length === 1 ? '' : 's'}` },
    { title: 'Belts', href: '/admin/belts', description: `${belts.length} belt${belts.length === 1 ? '' : 's'} on record` },
    { title: 'Classes', href: '/admin/classes', description: `${classes.length} class${classes.length === 1 ? '' : 'es'}` },
    { title: 'Tutorials', href: '/admin/tutorials', description: 'Manage tutorial content' },
  ];

  return (
    <div style={{ maxWidth: 960, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>
        Admin Dashboard
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'block',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 20,
              textDecoration: 'none',
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>
              {s.title}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {s.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}