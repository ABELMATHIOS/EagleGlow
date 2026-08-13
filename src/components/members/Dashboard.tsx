'use client';

import Link from 'next/link';
import { Status } from '@/src/types';
import { BELTS } from '@/src/data/belts';

// Real user data now comes in as a prop from app/dashboard/page.tsx (a
// Server Component that fetches it via getCurrentUser()). This component
// stays a client component for styling/interactivity, but no longer
// imports mock data itself.
type DashboardUser = {
  name: string;
  beltId?: string;
  status: Status;
  createdAt: string;
};

// Covers the full Status enum, not just pending/active, so a member in any
// other real status still renders correctly instead of hitting `undefined`.
const STATUS_LABEL: Record<Status, string> = {
  pending:   'Pending Approval',
  active:    'Active Member',
  graduated: 'Graduated',
  serving:   'Serving',
  paused:    'Paused',
  withdrawn: 'Withdrawn',
};
const STATUS_COLOR: Record<Status, string> = {
  pending:   '#E74C3C',
  active:    '#2ECC71',
  graduated: '#3498DB',
  serving:   '#9B59B6',
  paused:    '#F39C12',
  withdrawn: 'rgba(255,255,255,0.4)',
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

export default function Dashboard({ user }: { user: DashboardUser }) {
  const firstName = user.name.split(' ')[0];
  const currentBelt = BELTS.find((b) => b.id === user.beltId) ?? BELTS[0];
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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
              Welcome back, <span style={{ color: '#C9A84C' }}>{firstName}</span>
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
                background: STATUS_COLOR[user.status], margin: '0 auto 12px',
                boxShadow: `0 0 12px ${STATUS_COLOR[user.status]}88`,
              }} />
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 0 4px' }}>
                {STATUS_LABEL[user.status]}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Membership Status
              </p>
            </div>
            <div className="stat-card">
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 0 4px' }}>
                {joinDate}
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