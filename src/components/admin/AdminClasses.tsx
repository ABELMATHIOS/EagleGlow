'use client';

import { useState } from 'react';
import { ClassSchedule, ClassType } from '@/src/types';
import { createClass, updateClass, deleteClass as deleteClassAction } from '@/src/lib/admin-action';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TYPE_COLORS: Record<ClassType, string> = {
  wushu: '#C9A84C',
  fitness: 'rgba(255,255,255,0.5)',
};

function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

type Draft = {
  day: string;
  time: string;
  title: string;
  type: ClassType;
  level: string;
  instructor: string;
  durationMinutes: string;
};

const EMPTY_DRAFT: Draft = {
  day: DAYS[0],
  time: '',
  title: '',
  type: 'wushu',
  level: '',
  instructor: '',
  durationMinutes: '60',
};

type AdminClassesProps = {
  initialClasses: ClassSchedule[]; // real Supabase classes, fetched via getClasses()
};

export default function AdminClasses({ initialClasses }: AdminClassesProps) {
  const [classes,       setClasses]       = useState<ClassSchedule[]>(initialClasses);
  const [filterDay,     setFilterDay]     = useState('all');
  const [filterType,    setFilterType]    = useState('all');
  const [selected,      setSelected]      = useState<string | null>(null);
  const [adding,        setAdding]        = useState(false);
  const [draft,         setDraft]         = useState<Draft>(EMPTY_DRAFT);

  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  const filtered = classes
    .filter((c) => filterDay === 'all' || c.day === filterDay)
    .filter((c) => filterType === 'all' || c.type === filterType)
    .sort((a, b) => (a.day === b.day ? a.time.localeCompare(b.time) : DAYS.indexOf(a.day) - DAYS.indexOf(b.day)));

  const selectedClass = classes.find((c) => c.id === selected);

  const startAdd = () => {
    setDraft(EMPTY_DRAFT);
    setSelected(null);
    setSaveError(null);
    setAdding(true);
  };

  const startEdit = (c: ClassSchedule) => {
    setDraft({
      day: c.day,
      time: c.time,
      title: c.title,
      type: c.type,
      level: c.level ?? '',
      instructor: c.instructor ?? '',
      durationMinutes: String(c.durationMinutes),
    });
    setSelected(c.id);
    setSaveError(null);
    setAdding(false);
  };

  const cancelForm = () => {
    setAdding(false);
    setSelected(null);
  };

  const draftValid =
    draft.time.trim().length > 0 &&
    draft.title.trim().length > 0 &&
    Number(draft.durationMinutes) > 0;

  async function saveDraft() {
    if (!draftValid) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        day: draft.day,
        time: draft.time.trim(),
        title: draft.title.trim(),
        type: draft.type,
        level: draft.level.trim() || null,
        instructor: draft.instructor.trim() || null,
        durationMinutes: Number(draft.durationMinutes),
      };

      if (selected) {
        const { class: updated } = await updateClass(selected, payload);
        setClasses((prev) => prev.map((c) => (c.id === selected ? toClass(updated) : c)));
      } else {
        const { class: created } = await createClass(payload);
        setClasses((prev) => [...prev, toClass(created)]);
      }

      setAdding(false);
      setSelected(null);
      setDraft(EMPTY_DRAFT);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteClassAction(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (selected === id) setSelected(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete class');
    } finally {
      setDeletingId(null);
    }
  }

  const showForm = adding || Boolean(selectedClass);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .classes-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          align-items: start;
        }
        .classes-table-wrap {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .classes-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
        }
        .classes-table th {
          text-align: left;
          padding: 12px 18px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .classes-table td {
          padding: 13px 18px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          white-space: nowrap;
        }
        .classes-table tr:last-child td { border-bottom: none; }
        .classes-table tr { cursor: pointer; }
        .classes-table tr:hover td { background: rgba(255,255,255,0.02); }
        .classes-table tr.row-selected td { background: rgba(201,168,76,0.05); }

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
          box-sizing: border-box;
          width: 100%;
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
        .admin-select option {
          background: #111;
          color: #fff;
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
        .admin-btn-gold:hover:not(:disabled) { background: #d9b85a; }
        .admin-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
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
        .admin-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
        .admin-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-btn-danger {
          background: rgba(231,76,60,0.1);
          color: #E74C3C;
          border: 1px solid rgba(231,76,60,0.3);
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.18s;
        }
        .admin-btn-danger:hover { background: rgba(231,76,60,0.18); }
        .admin-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        .detail-panel {
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 22px;
          position: sticky;
          top: 20px;
        }
        .field-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin: 0 0 6px;
          display: block;
        }
        .field-error { font-size: 11px; color: #E74C3C; margin: 4px 0 0; }
        @media (max-width: 1000px) {
          .classes-layout { grid-template-columns: 1fr; }
          .detail-panel { position: static; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 22,
            fontWeight: 700, color: '#fff', margin: '0 0 4px 0',
          }}>Classes</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.35)', margin: 0,
          }}>
            {classes.length} classes scheduled across the week
          </p>
        </div>
        <button className="admin-btn-gold" onClick={startAdd}>+ Add Class</button>
      </div>

      {saveError && !showForm && <p className="field-error" style={{ marginBottom: 16 }}>{saveError}</p>}

      {/* Filters */}
      <div className="filter-bar">
        <select className="admin-select" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
          <option value="all">All Days</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="admin-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="wushu">Wushu</option>
          <option value="fitness">Fitness</option>
        </select>
      </div>

      <div className="classes-layout">
        {/* Table */}
        <div className="classes-table-wrap">
          <table className="classes-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Class</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                    No classes found
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => startEdit(c)}
                  className={selected === c.id ? 'row-selected' : ''}
                >
                  <td style={{ color: 'rgba(255,255,255,0.5)' }}>{c.day}</td>
                  <td style={{ color: '#C9A84C', fontWeight: 600 }}>{c.time}</td>
                  <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{c.title}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: TYPE_COLORS[c.type],
                      background: `${TYPE_COLORS[c.type]}18`,
                      border: `0.5px solid ${TYPE_COLORS[c.type]}40`,
                      borderRadius: 100, padding: '2px 9px',
                      textTransform: 'uppercase',
                    }}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{formatDuration(c.durationMinutes)}</td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{c.level ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add / Edit panel */}
        <div className="detail-panel">
          {!showForm ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                Select a class to edit, or add a new one
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>
                {selected ? 'Edit Class' : 'New Class'}
              </p>

              <div>
                <label className="field-label">Day</label>
                <select className="admin-select" style={{ width: '100%' }} value={draft.day} onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="field-label">Time</label>
                <input className="admin-input" placeholder="e.g. 17:00" value={draft.time} onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))} />
              </div>

              <div>
                <label className="field-label">Class Title</label>
                <input className="admin-input" placeholder="e.g. Wushu — Taolu" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              </div>

              <div>
                <label className="field-label">Type</label>
                <select className="admin-select" style={{ width: '100%' }} value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as ClassType }))}>
                  <option value="wushu">Wushu</option>
                  <option value="fitness">Fitness</option>
                </select>
              </div>

              <div>
                <label className="field-label">Duration (minutes)</label>
                <input className="admin-input" type="number" min={1} value={draft.durationMinutes} onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: e.target.value }))} />
              </div>

              <div>
                <label className="field-label">Level (optional)</label>
                <input className="admin-input" placeholder="e.g. All Levels, Beginners" value={draft.level} onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value }))} />
              </div>

              <div>
                <label className="field-label">Instructor (optional)</label>
                <input className="admin-input" placeholder="e.g. Master Endale" value={draft.instructor} onChange={(e) => setDraft((d) => ({ ...d, instructor: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="admin-btn-gold" style={{ flex: 1 }} disabled={!draftValid || saving} onClick={saveDraft}>
                  {saving ? 'Saving...' : selected ? 'Save Changes' : 'Add Class'}
                </button>
                <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={cancelForm} disabled={saving}>Cancel</button>
              </div>

              {saveError && <p className="field-error">{saveError}</p>}

              {selected && (
                <button
                  className="admin-btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => handleDelete(selected)}
                  disabled={deletingId === selected}
                >
                  {deletingId === selected ? 'Deleting...' : 'Delete Class'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Converts the API response's snake_case-adjacent shape (normalized by the
// classes API routes) into the ClassSchedule type this component uses.
function toClass(raw: any): ClassSchedule {
  return {
    id: raw.id,
    day: raw.day,
    time: raw.time,
    title: raw.title,
    type: raw.type,
    level: raw.level ?? undefined,
    instructor: raw.instructor ?? undefined,
    durationMinutes: raw.duration_minutes,
  };
}