'use client';

import Link from 'next/link';
import { Status } from '@/src/types';
import type { DisciplineWithCount } from '@/src/lib/disciplines';

// Sanda equivalent of Dashboard.tsx. No belt card (disciplines aren't
// a progression ladder), no single tutorial-progress bar — "Continue
// Training" opens into a grid of disciplines instead of one link, each
// working like the existing belt-tutorial pages but organized by
// discipline. Conditioning is just another discipline row, not special-
// cased. Competition Path is intentionally not included this round.
type SandaDashboardUser = {
  name: string;
  status: Status;
  createdAt: string;
};

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

export default function SandaDashboard({
  user,
  disciplines,
}: {
  user: SandaDashboardUser;
  disciplines: DisciplineWithCount[];
}) {
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
        .discipline-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          text-decoration: none;
          min-height: 100px;
          transition: all 0.25s ease;
        }
        .discipline-card:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.04);
          transform: translateY(-2px);
        }
        .discipline-card.empty {
          cursor: default;
          opacity: 0.55;
        }
        .discipline-card.empty:hover {
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
        .discipline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
            <SectionLabel text="Sanda Dashboard" />
            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)', margin: 0,
            }}>
              Welcome back, <span style={{ color: '#C9A84C' }}>{firstName}</span>
            </h1>
          </div>

          {/* Stat cards — two only: no belt card for Sanda */}
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

          {/* Continue Training — discipline grid */}
          <div style={{ marginBottom: 40 }}>
            <p style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15,
              color: '#fff', margin: '0 0 16px',
            }}>
              Continue Training
            </p>

            {disciplines.length === 0 ? (
              <div style={{
                background: '#111111',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  Training content is coming soon — check back here for updates.
                </p>
              </div>
            ) : (
              <div className="discipline-grid">
                {disciplines.map((d) => {
                  const hasVideos = d.videoCount > 0;
                  const card = (
                    <>
                      <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 6px' }}>
                        {d.name}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {hasVideos ? `${d.videoCount} video${d.videoCount === 1 ? '' : 's'}` : 'Coming soon'}
                      </p>
                    </>
                  );
                  return hasVideos ? (
                    <Link key={d.id} href={`/dashboard/sanda/disciplines/${d.slug}`} className="discipline-card">
                      {card}
                    </Link>
                  ) : (
                    <div key={d.id} className="discipline-card empty">
                      {card}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick action links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
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