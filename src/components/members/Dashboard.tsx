'use client';

import Link from 'next/link';

const BELTS = [
  { name: 'White',  slug: 'white',  color: '#FFFFFF', textColor: '#111' },
  { name: 'Yellow', slug: 'yellow', color: '#FFD700', textColor: '#111' },
  { name: 'Green',  slug: 'green',  color: '#2ECC71', textColor: '#111' },
  { name: 'Blue',   slug: 'blue',   color: '#3498DB', textColor: '#fff' },
  { name: 'Red',    slug: 'red',    color: '#E74C3C', textColor: '#fff' },
  { name: 'Brown',  slug: 'brown',  color: '#8B4513', textColor: '#fff' },
  { name: 'Black',  slug: 'black',  color: '#C9A84C', textColor: '#111' },
];

// Mock member data — replace with real Supabase data later
const MEMBER = {
  name: 'Yonas',
  beltLevel: 3, // Green belt — matches Profile.tsx
  status: 'active' as 'pending' | 'active', // matches the Status enum in types/index.ts
  joinDate: 'March 2022', // matches Profile.tsx
};

const STATUS_LABEL: Record<typeof MEMBER.status, string> = {
  pending: 'Pending Approval',
  active: 'Active Member',
};
const STATUS_COLOR: Record<typeof MEMBER.status, string> = {
  pending: '#E74C3C',
  active: '#2ECC71',
};

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      justifyContent: 'center', marginBottom: 18,
    }}>
      <span style={{ flex: 1, maxWidth: 60, height: 1, background: 'rgba(201,168,76,0.4)' }} />
      <span style={{
        color: '#C9A84C', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
      }}>{text}</span>
      <span style={{ flex: 1, maxWidth: 60, height: 1, background: 'rgba(201,168,76,0.4)' }} />
    </div>
  );
}

export default function Dashboard() {
  const currentBelt = BELTS[MEMBER.beltLevel - 1];

  return (
    <>
      <style>{`
        .quick-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 24px;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .quick-link:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.04);
          transform: translateY(-2px);
        }
        .stat-card {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        padding: '100px 24px 60px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* Welcome header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel text="Member Dashboard" />
            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)', margin: 0,
            }}>
              Welcome back, <span style={{ color: '#C9A84C' }}>{MEMBER.name}</span>
            </h1>
          </div>

          {/* Stat cards */}
          <div className="dash-grid" style={{ marginBottom: 40 }}>
            <div className="stat-card">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: currentBelt.color, margin: '0 auto 12px',
                boxShadow: `0 0 16px ${currentBelt.color}55`,
              }} />
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 0 4px' }}>
                {currentBelt.name} Belt
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Current Level
              </p>
            </div>
            <div className="stat-card">
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: STATUS_COLOR[MEMBER.status], margin: '0 auto 12px',
                boxShadow: `0 0 12px ${STATUS_COLOR[MEMBER.status]}88`,
              }} />
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 0 4px' }}>
                {STATUS_LABEL[MEMBER.status]}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Membership Status
              </p>
            </div>
            <div className="stat-card">
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 0 4px' }}>
                {MEMBER.joinDate}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Member Since
              </p>
            </div>
          </div>

          {/* Quick action links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Link href="/tutorials" className="quick-link">
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
                  Continue Training
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  View belt tutorials
                </p>
              </div>
              <span style={{ color: '#C9A84C', fontSize: 20 }}>→</span>
            </Link>
            <Link href="/profile" className="quick-link">
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
                  My Profile
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Manage your account
                </p>
              </div>
              <span style={{ color: '#C9A84C', fontSize: 20 }}>→</span>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}