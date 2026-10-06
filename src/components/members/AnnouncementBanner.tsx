import type { Announcement } from '@/src/types';

export default function AnnouncementBanner({ items }: { items: Announcement[] }) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
      {items.map((a) => (
        <div
          key={a.id}
          style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 16,
            padding: '16px 20px',
          }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#C9A84C', margin: '0 0 6px',
          }}>
            Announcement
          </p>
          <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 6px' }}>
            {a.title}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)',
            margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line',
          }}>
            {a.content}
          </p>
        </div>
      ))}
    </div>
  );
}