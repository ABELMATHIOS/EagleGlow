'use client';

import Link from 'next/link';
import { Status, Belt } from '@/src/types';

// Real user data comes in as a prop from app/dashboard/page.tsx (a Server
// Component that fetches it via getCurrentUser()). `belts` is likewise a
// real prop (from getBelts()) — this component previously looked belts up
// via the mock src/data/belts.ts, whose fake ids ("belt-1"..) never matched
// a real member's beltId (a genuine Supabase UUID), so every member showed
// as White belt regardless of their actual level.
type DashboardUser = {
  name: string;
  beltId?: string;
  status: Status;
  createdAt: string;
};

type DashboardProgress = {
  totalTutorials: number;
  completedCount: number;
  lastWatched: { tutorialId: string; title: string; beltSlug: string } | null;
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

export default function Dashboard({ user, progress, belts }: { user: DashboardUser; progress: DashboardProgress; belts: Belt[] }) {
  const firstName = user.name.split(' ')[0];
  const currentBelt = belts.find((b) => b.id === user.beltId) ?? belts[0];
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const progressPct = progress.totalTutorials > 0
    ? Math.round((progress.completedCount / progress.totalTutorials) * 100)
    : 0;

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

          {/* Progress bar */}
          <div style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>
                Tutorial Progress
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                {progress.completedCount} / {progress.totalTutorials} completed
              </p>
            </div>
            <div style={{
              width: '100%', height: 8, borderRadius: 4,
              background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${progressPct}%`, height: '100%',
                background: currentBelt.color,
                boxShadow: `0 0 10px ${currentBelt.color}88`,
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* Resume last tutorial */}
          {progress.lastWatched && (
            <Link
              href={`/tutorials/${progress.lastWatched.beltSlug}?t=${progress.lastWatched.tutorialId}`}
              className="quick-link"
              style={{ display: 'flex', marginBottom: 40 }}
            >
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 6px' }}>
                  Resume Where You Left Off
                </p>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 16, color: '#fff', margin: 0 }}>
                  {progress.lastWatched.title}
                </p>
              </div>
              <span style={{ color: '#C9A84C', fontSize: 20 }}>→</span>
            </Link>
          )}
          {!progress.lastWatched && <div style={{ marginBottom: 40 }} />}

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