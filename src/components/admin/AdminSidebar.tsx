'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Overview',
    href: '/admin',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Members',
    href: '/admin/members',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Tutorials',
    href: '/admin/tutorials',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    label: 'Classes',
    href: '/admin/classes',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
  label: 'Gallery',
  href: '/admin/gallery',
  icon: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  },
  {
    label: 'Back to Site',
    href: '/',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    dividerBefore: true,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;500;600&display=swap');

        .admin-sidebar {
          width: 220px;
          background: #111111;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: background 0.18s, color 0.18s;
          border: 1px solid transparent;
        }
        .admin-nav-item:hover {
          background: rgba(201,168,76,0.08);
          color: rgba(255,255,255,0.8);
        }
        .admin-nav-item.active {
          background: rgba(201,168,76,0.12);
          color: #C9A84C;
          border-color: rgba(201,168,76,0.2);
        }
        .admin-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 8px 0;
        }
        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
        }
      `}</style>

      <aside className="admin-sidebar">
        {/* Logo */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link href="/admin" style={{
            display: 'flex', alignItems: 'center',
            gap: 10, textDecoration: 'none',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              overflow: 'hidden', border: '1.5px solid rgba(201,168,76,0.4)',
              flexShrink: 0, position: 'relative',
            }}>
              <Image
                src="/images/Eagle-Logo.png"
                alt="EagleGlow"
                fill
                style={{ objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: 13,
                fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1,
              }}>
                <span style={{ color: '#C9A84C' }}>EAGLE</span>GLOW
              </p>
              <p style={{
                fontSize: 9, color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                margin: '3px 0 0', fontFamily: 'Inter, sans-serif',
              }}>
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <div key={item.href}>
                {item.dividerBefore && <div className="admin-divider" />}
                <Link
                  href={item.href}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{
            fontSize: 10, color: 'rgba(255,255,255,0.2)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.08em', margin: 0,
          }}>
            © 2025 EagleGlow
          </p>
        </div>
      </aside>
    </>
  );
}