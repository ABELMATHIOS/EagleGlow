'use client';

import Link from 'next/link';

// Mock data — replace with Supabase queries later
const STATS = [
  { label: 'Total Members',    value: '48',  delta: '+3 this month',  color: '#C9A84C' },
  { label: 'Pending Approval', value: '5',   delta: 'Needs action',   color: '#E74C3C' },
  { label: 'Active Members',   value: '41',  delta: '85% of total',   color: '#2ECC71' },
  { label: 'Belt Promotions',  value: '7',   delta: 'This quarter',   color: '#3498DB' },
];

const RECENT_MEMBERS = [
  { name: 'Kaleb Haile',    belt: 'White',  status: 'pending', joined: '2 days ago'  },
  { name: 'Meron Tesfaye',  belt: 'Yellow', status: 'active',  joined: '1 week ago'  },
  { name: 'Samuel Girma',   belt: 'Green',  status: 'active',  joined: '2 weeks ago' },
  { name: 'Liya Bekele',    belt: 'White',  status: 'pending', joined: '3 weeks ago' },
  { name: 'Dawit Alemu',    belt: 'Blue',   status: 'active',  joined: '1 month ago' },
];

const BELT_COLORS: Record<string, string> = {
  White: '#FFFFFF', Yellow: '#FFD700', Green: '#2ECC71',
  Blue: '#3498DB',  Red: '#E74C3C',   Brown: '#8B4513', Black: '#C9A84C',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#E74C3C',
  active:  '#2ECC71',
};

export default function AdminOverview() {
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
                {RECENT_MEMBERS.map((m) => (
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
            { label: 'Review Pending Members', href: '/admin/members?filter=pending', badge: '5', color: '#E74C3C' },
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
            {[
              { belt: 'White',  count: 18 },
              { belt: 'Yellow', count: 12 },
              { belt: 'Green',  count: 8  },
              { belt: 'Blue',   count: 5  },
              { belt: 'Red',    count: 3  },
              { belt: 'Brown',  count: 2  },
              { belt: 'Black',  count: 1  },
            ].map((b) => (
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
                    width: `${(b.count / 18) * 100}%`,
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