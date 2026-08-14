'use client';

import Link from 'next/link';
import { Status, User, Belt } from '@/src/types';

type AdminOverviewProps = {
  members: User[];
  belts: Belt[]; // real Supabase belts, sorted by order ascending
};

// Covers the full Status enum, not just pending/active, so any real status
// still gets a color instead of falling through to `undefined`.
const STATUS_COLORS: Record<Status, string> = {
  pending:   '#E74C3C',
  active:    '#2ECC71',
  graduated: '#3498DB',
  serving:   '#9B59B6',
  paused:    '#F39C12',
  withdrawn: 'rgba(255,255,255,0.4)',
};

export default function AdminOverview({ members, belts }: AdminOverviewProps) {
  // Derived from the real member/belt lists passed in from app/admin/page.tsx
  // (a Server Component fetching via getAllMembers() + getBelts()). Replaces
  // the old MOCK_MEMBERS / BELTS mock imports — same shape, real source.
  const beltById = new Map(belts.map((b) => [b.id, b]));
  const BELT_COLORS: Record<string, string> = Object.fromEntries(belts.map((b) => [b.name, b.color]));

  const totalMembers = members.length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const activeCount = members.filter((m) => m.status === 'active').length;

  const STATS = [
    { label: 'Total Members',    value: String(totalMembers), delta: `${totalMembers} on record`, color: '#C9A84C' },
    { label: 'Pending Approval', value: String(pendingCount),  delta: pendingCount > 0 ? 'Needs action' : 'All caught up', color: '#E74C3C' },
    { label: 'Active Members',   value: String(activeCount),   delta: totalMembers > 0 ? `${Math.round((activeCount / totalMembers) * 100)}% of total` : '0% of total', color: '#2ECC71' },
    // Belt-promotion history isn't modeled yet (would come from
    // MembershipHistory once that table exists) — left as a static placeholder.
    { label: 'Belt Promotions',  value: '—', delta: 'Not tracked yet', color: '#3498DB' },
  ];

  const RECENT_MEMBERS = [...members]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((m) => ({
      name: m.name,
      belt: (m.beltId && beltById.get(m.beltId)?.name) || belts[0]?.name || 'White',
      status: m.status,
      joined: m.createdAt,
    }));

  // Real belt distribution — count of members per belt, ordered same as belts.
  const beltCounts = belts.map((b) => ({
    belt: b.name,
    count: members.filter((m) => (m.beltId ? m.beltId === b.id : b === belts[0])).length,
  }));
  const maxBeltCount = Math.max(1, ...beltCounts.map((b) => b.count)); // avoid divide-by-zero

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 22px;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: rgba(201,168,76,0.2); }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
        }
        .admin-table-wrap {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
        }
        .admin-table th {
          text-align: left;
          padding: 12px 20px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .admin-table td {
          padding: 13px 20px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(255,255,255,0.02); }

        .quick-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-radius: 12px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          text-decoration: none;
          transition: all 0.2s;
          margin-bottom: 10px;
        }
        .quick-action:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.04);
        }

        @media (max-width: 1100px) {
          .overview-stats { grid-template-columns: repeat(2, 1fr); }
          .overview-grid  { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .overview-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'Inter, sans-serif', fontSize: 22,
          fontWeight: 700, color: '#fff', margin: '0 0 4px 0',
        }}>
          Overview
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13,
          color: 'rgba(255,255,255,0.35)', margin: 0,
        }}>
          Welcome back, Master Endale. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats */}
      <div className="overview-stats">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10,
              fontWeight: 600, color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              margin: '0 0 10px 0',
            }}>
              {s.label}
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 32,
              fontWeight: 700, color: s.color, margin: '0 0 4px 0', lineHeight: 1,
            }}>
              {s.value}
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11,
              color: 'rgba(255,255,255,0.25)', margin: 0,
            }}>
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="overview-grid">

        {/* Recent members table */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14,
          }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              fontWeight: 600, color: '#fff', margin: 0,
            }}>
              Recent Members
            </h2>
            <Link href="/admin/members" style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12,
              color: '#C9A84C', textDecoration: 'none', fontWeight: 500,
            }}>
              View all →
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Belt</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_MEMBERS.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                      No members yet
                    </td>
                  </tr>
                ) : RECENT_MEMBERS.map((m) => (
                  <tr key={m.name}>
                    <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                      {m.name}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: BELT_COLORS[m.belt] ?? '#fff',
                          border: m.belt === 'White' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          flexShrink: 0,
                        }} />
                        {m.belt}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: STATUS_COLORS[m.status],
                        background: `${STATUS_COLORS[m.status]}18`,
                        border: `0.5px solid ${STATUS_COLORS[m.status]}40`,
                        borderRadius: 100, padding: '2px 9px',
                        textTransform: 'capitalize',
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                      {m.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 14,
            fontWeight: 600, color: '#fff', margin: '0 0 14px 0',
          }}>
            Quick Actions
          </h2>

          {[
            { label: 'Review Pending Members', href: '/admin/members?filter=pending', badge: pendingCount > 0 ? String(pendingCount) : null, color: '#E74C3C' },
            { label: 'Promote a Belt',         href: '/admin/members',                badge: null, color: '#C9A84C' },
            { label: 'Add Tutorial Video',     href: '/admin/tutorials',              badge: null, color: '#C9A84C' },
            { label: 'Update Class Schedule',  href: '/admin/classes',                badge: null, color: '#C9A84C' },
          ].map((a) => (
            <Link key={a.label} href={a.href} className="quick-action">
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.7)', fontWeight: 500,
              }}>
                {a.label}
              </span>
              {a.badge ? (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: a.color, color: '#fff',
                  borderRadius: 100, padding: '2px 8px',
                  minWidth: 22, textAlign: 'center',
                }}>
                  {a.badge}
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>›</span>
              )}
            </Link>
          ))}

          {/* Belt distribution */}
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '18px 18px', marginTop: 20,
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12,
              fontWeight: 600, color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              margin: '0 0 14px 0',
            }}>
              Belt Distribution
            </p>
            {beltCounts.map((b) => (
              <div key={b.belt} style={{
                display: 'flex', alignItems: 'center',
                gap: 10, marginBottom: 8,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: BELT_COLORS[b.belt],
                  border: b.belt === 'White' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 12,
                  color: 'rgba(255,255,255,0.5)', width: 50,
                }}>
                  {b.belt}
                </span>
                <div style={{
                  flex: 1, height: 4, background: 'rgba(255,255,255,0.06)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: BELT_COLORS[b.belt],
                    width: `${(b.count / maxBeltCount) * 100}%`,
                    opacity: b.belt === 'White' ? 0.4 : 0.8,
                  }} />
                </div>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 12,
                  color: 'rgba(255,255,255,0.3)', width: 20, textAlign: 'right',
                }}>
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}