'use client';

import { useState } from 'react';

const BELTS = ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Brown', 'Black'];
const BELT_COLORS: Record<string, string> = {
  White: '#FFFFFF', Yellow: '#FFD700', Green: '#2ECC71',
  Blue: '#3498DB',  Red: '#E74C3C',   Brown: '#8B4513', Black: '#C9A84C',
};
const STATUS_COLORS: Record<string, string> = {
  pending: '#E74C3C', active: '#2ECC71',
  graduated: '#C9A84C', paused: '#F39C12',
};

// Mock data — replace with Supabase query later
const MEMBERS = [
  { id: '1', name: 'Kaleb Haile',     email: 'kaleb@email.com',   belt: 'White',  status: 'pending',   joined: 'May 2025',   phone: '+251-91-111-1111' },
  { id: '2', name: 'Meron Tesfaye',   email: 'meron@email.com',   belt: 'Yellow', status: 'active',    joined: 'Apr 2025',   phone: '+251-91-222-2222' },
  { id: '3', name: 'Samuel Girma',    email: 'samuel@email.com',  belt: 'Green',  status: 'active',    joined: 'Mar 2025',   phone: '+251-91-333-3333' },
  { id: '4', name: 'Liya Bekele',     email: 'liya@email.com',    belt: 'White',  status: 'pending',   joined: 'May 2025',   phone: '+251-91-444-4444' },
  { id: '5', name: 'Dawit Alemu',     email: 'dawit@email.com',   belt: 'Blue',   status: 'active',    joined: 'Jan 2025',   phone: '+251-91-555-5555' },
  { id: '6', name: 'Hana Desta',      email: 'hana@email.com',    belt: 'Red',    status: 'active',    joined: 'Nov 2024',   phone: '+251-91-666-6666' },
  { id: '7', name: 'Yonas Tadesse',   email: 'yonas@email.com',   belt: 'Green',  status: 'active',    joined: 'Feb 2025',   phone: '+251-91-777-7777' },
  { id: '8', name: 'Tigist Worku',    email: 'tigist@email.com',  belt: 'Yellow', status: 'paused',    joined: 'Dec 2024',   phone: '+251-91-888-8888' },
];

export default function AdminMembers() {
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterBelt,    setFilterBelt]    = useState('all');
  const [selected,      setSelected]      = useState<string | null>(null);
  const [promoting,     setPromoting]     = useState(false);

  const filtered = MEMBERS.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchBelt   = filterBelt   === 'all' || m.belt   === filterBelt;
    return matchSearch && matchStatus && matchBelt;
  });

  const selectedMember = MEMBERS.find((m) => m.id === selected);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .members-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: start;
        }
        .members-table-wrap {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .members-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
        }
        .members-table th {
          text-align: left;
          padding: 12px 18px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .members-table td {
          padding: 13px 18px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          white-space: nowrap;
        }
        .members-table tr:last-child td { border-bottom: none; }
        .members-table tr { cursor: pointer; }
        .members-table tr:hover td { background: rgba(255,255,255,0.02); }
        .members-table tr.row-selected td { background: rgba(201,168,76,0.05); }

        .filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          align-items: center;
        }
        .admin-input {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: rgba(201,168,76,0.4); }
        .admin-input::placeholder { color: rgba(255,255,255,0.2); }
        .admin-select {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          font-family: 'Inter', sans-serif;
          outline: none;
          cursor: pointer;
        }
        .admin-btn-gold {
          background: #C9A84C;
          color: #111;
          border: none;
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.18s;
          letter-spacing: 0.04em;
        }
        .admin-btn-gold:hover { background: #d9b85a; }
        .admin-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.18s;
        }
        .admin-btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
        }
        .detail-panel {
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 22px;
          position: sticky;
          top: 20px;
        }
        @media (max-width: 1000px) {
          .members-layout { grid-template-columns: 1fr; }
          .detail-panel { position: static; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 22,
            fontWeight: 700, color: '#fff', margin: '0 0 4px 0',
          }}>Members</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.35)', margin: 0,
          }}>
            {MEMBERS.length} total · {MEMBERS.filter(m => m.status === 'pending').length} pending
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="admin-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="admin-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="graduated">Graduated</option>
        </select>
        <select
          className="admin-select"
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
        >
          <option value="all">All Belts</option>
          {BELTS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="members-layout">
        {/* Table */}
        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Belt</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                    No members found
                  </td>
                </tr>
              ) : filtered.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setSelected(m.id === selected ? null : m.id)}
                  className={selected === m.id ? 'row-selected' : ''}
                >
                  <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {m.name}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: BELT_COLORS[m.belt],
                        border: m.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        flexShrink: 0,
                      }} />
                      {m.belt}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: STATUS_COLORS[m.status] ?? '#fff',
                      background: `${STATUS_COLORS[m.status] ?? '#fff'}18`,
                      border: `0.5px solid ${STATUS_COLORS[m.status] ?? '#fff'}40`,
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

        {/* Detail Panel */}
        <div className="detail-panel">
          {!selectedMember ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.2)', margin: 0,
              }}>
                Select a member to view details
              </p>
            </div>
          ) : (
            <div>
              {/* Member info */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#C9A84C',
                  fontFamily: 'Inter, sans-serif', flexShrink: 0,
                }}>
                  {selectedMember.name[0]}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 14,
                    fontWeight: 600, color: '#fff', margin: '0 0 2px 0',
                  }}>
                    {selectedMember.name}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                    color: 'rgba(255,255,255,0.3)', margin: 0,
                  }}>
                    {selectedMember.email}
                  </p>
                </div>
              </div>

              {/* Info rows */}
              {[
                { label: 'Phone',  value: selectedMember.phone  },
                { label: 'Joined', value: selectedMember.joined },
              ].map((row) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 12,
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Belt */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20,
              }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  Belt
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Inter, sans-serif', fontSize: 12,
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: BELT_COLORS[selectedMember.belt],
                    border: selectedMember.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  }} />
                  {selectedMember.belt}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Approve if pending */}
                {selectedMember.status === 'pending' && (
                  <button className="admin-btn-gold" style={{ width: '100%' }}>
                    ✓ Approve Member
                  </button>
                )}

                {/* Promote belt */}
                {selectedMember.status === 'active' && (
                  <>
                    {!promoting ? (
                      <button
                        className="admin-btn-gold"
                        style={{ width: '100%' }}
                        onClick={() => setPromoting(true)}
                      >
                        ↑ Promote Belt
                      </button>
                    ) : (
                      <div>
                        <select className="admin-select" style={{ width: '100%', marginBottom: 8 }}>
                          {BELTS.slice(BELTS.indexOf(selectedMember.belt) + 1).map((b) => (
                            <option key={b} value={b}>{b} Belt</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="admin-btn-gold" style={{ flex: 1 }}>Confirm</button>
                          <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => setPromoting(false)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button className="admin-btn-ghost" style={{ width: '100%' }}>
                  Suspend Member
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}