'use client';

import { useState } from 'react';

const BELTS = ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Brown', 'Black'];
const BELT_COLORS: Record<string, string> = {
  White: '#FFFFFF', Yellow: '#FFD700', Green: '#2ECC71',
  Blue: '#3498DB',  Red: '#E74C3C',   Brown: '#8B4513', Black: '#C9A84C',
};

const TUTORIALS = [
  { id: '1', belt: 'White',  title: 'Basic Stance & Footwork',     duration: '12:00', published: true  },
  { id: '2', belt: 'White',  title: 'Introduction to Taolu',        duration: '18:30', published: true  },
  { id: '3', belt: 'White',  title: 'Basic Punching Techniques',    duration: '15:00', published: true  },
  { id: '4', belt: 'Yellow', title: 'Intermediate Stances',         duration: '20:00', published: true  },
  { id: '5', belt: 'Yellow', title: 'Kicking Fundamentals',         duration: '22:45', published: true  },
  { id: '6', belt: 'Green',  title: 'Advanced Taolu Forms',         duration: '35:00', published: true  },
  { id: '7', belt: 'Green',  title: 'Sanda Introduction',           duration: '28:00', published: false },
  { id: '8', belt: 'Blue',   title: 'Advanced Combat Techniques',   duration: '40:00', published: false },
];

export default function AdminTutorials() {
  const [filterBelt, setFilterBelt]   = useState('all');
  const [showForm,   setShowForm]     = useState(false);
  const [newBelt,    setNewBelt]      = useState('White');
  const [newTitle,   setNewTitle]     = useState('');
  const [newUrl,     setNewUrl]       = useState('');

  const filtered = filterBelt === 'all'
    ? TUTORIALS
    : TUTORIALS.filter((t) => t.belt === filterBelt);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .tut-table-wrap {
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .tut-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
        }
        .tut-table th {
          text-align: left;
          padding: 12px 18px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .tut-table td {
          padding: 13px 18px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .tut-table tr:last-child td { border-bottom: none; }
        .tut-table tr:hover td { background: rgba(255,255,255,0.02); }

        .add-form {
          background: #111;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .admin-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: rgba(201,168,76,0.4); }
        .admin-input::placeholder { color: rgba(255,255,255,0.2); }
        .admin-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          font-family: 'Inter', sans-serif;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          cursor: pointer;
        }
        .admin-btn-gold {
          background: #C9A84C; color: #111;
          border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 13px;
          font-weight: 700; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background 0.18s;
        }
        .admin-btn-gold:hover { background: #d9b85a; }
        .admin-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 20px; font-size: 13px;
          font-weight: 600; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .admin-btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
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
          }}>Tutorials</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.35)', margin: 0,
          }}>
            {TUTORIALS.length} videos · {TUTORIALS.filter(t => t.published).length} published
          </p>
        </div>
        <button
          className="admin-btn-gold"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Tutorial'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="add-form">
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            fontWeight: 600, color: '#C9A84C',
            margin: '0 0 16px 0', letterSpacing: '0.05em',
          }}>
            Add New Tutorial
          </p>
          <div className="form-row">
            <select
              className="admin-select"
              value={newBelt}
              onChange={(e) => setNewBelt(e.target.value)}
            >
              {BELTS.map((b) => <option key={b} value={b}>{b} Belt</option>)}
            </select>
            <input
              className="admin-input"
              placeholder="Tutorial title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <input
            className="admin-input"
            placeholder="YouTube video URL (e.g. https://youtube.com/watch?v=...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="admin-btn-gold">Save Tutorial</button>
            <button className="admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          className="admin-select"
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="all">All Belts</option>
          {BELTS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="tut-table-wrap">
        <table className="tut-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Belt</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                  {t.title}
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: BELT_COLORS[t.belt],
                      border: t.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                      flexShrink: 0,
                    }} />
                    {t.belt}
                  </span>
                </td>
                <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  {t.duration}
                </td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: t.published ? '#2ECC71' : 'rgba(255,255,255,0.3)',
                    background: t.published ? '#2ECC7118' : 'rgba(255,255,255,0.04)',
                    border: `0.5px solid ${t.published ? '#2ECC7140' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 100, padding: '2px 9px',
                  }}>
                    {t.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 11, color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.18s',
                    }}>
                      Edit
                    </button>
                    <button style={{
                      background: 'transparent',
                      border: '1px solid rgba(231,76,60,0.3)',
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 11, color: '#E74C3C',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}