'use client';

import Link from 'next/link';
import { Status } from '@/src/types';

// Fitness equivalent of Dashboard.tsx. No belt card, no tutorial progress —
// neither exists for the Fitness program yet. "Continue Training" becomes
// a static "Coming Soon" card instead of a working link; "My Profile"
// stays a real link since profile editing (minus belt-specific parts)
// still applies to Fitness members.
type FitnessDashboardUser = {
  name: string;
  status: Status;
  createdAt: string;
};

// Covers the full Status enum, matching Dashboard.tsx's STATUS_LABEL/COLOR
// so a Fitness member in any real status renders correctly.
const STATUS_LABEL: Record<Status, string> = {
  pending:   'Pending Approval',
  active:    'Active Member',
  graduated: 'Graduated',
  serving:   'Serving',
  paused:    'Paused',
  withdrawn: 'Withdrawn',
  served:    'Served',
};
const STATUS_COLOR: Record<Status, string> = {
  pending:   '#E74C3C',
  active:    '#2ECC71',
  graduated: '#3498DB',
  serving:   '#9B59B6',
  paused:    '#F39C12',
  withdrawn: 'rgba(255,255,255,0.4)',
  served:    '#3498DB',
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

export default function FitnessDashboard({ user }: { user: FitnessDashboardUser }) {
  const firstName = user.name.split(' ')[0];
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
        .quick-link.disabled {
          cursor: default;
          opacity: 0.6;
        }
        .quick-link.disabled:hover {
          border-color: rgba(255,255,255,0.06);
          background: #111111;
          transform: none;
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
          grid-template-columns: repeat(2, 1fr);
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
            <SectionLabel text="Fitness Dashboard" />
            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)', margin: 0,
            }}>
              Welcome back, <span style={{ color: '#C9A84C' }}>{firstName}</span>
            </h1>
          </div>

          {/* Stat cards — two only: no belt card for Fitness */}
          <div className="dash-grid" style={{ marginBottom: 40 }}>
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

          {/* Coming soon notice — replaces the tutorial progress bar,
              which has no Fitness equivalent yet */}
          <div style={{
            background: '#111111',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 40,
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
              Your class content and tutorials are coming soon — check back here for updates.
            </p>
          </div>

          {/* Quick action links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="quick-link disabled">
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
                  Continue Training
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Coming soon
                </p>
              </div>
            </div>
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
            <Link href="/dashboard/rules" className="quick-link">
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
                  Rules & Regulations
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Club conduct guidelines
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