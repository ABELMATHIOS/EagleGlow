'use client';

import React, { useState } from 'react';
import type { ClassSchedule } from '@/src/types';
import { createClass, updateClass, deleteClass } from '@/src/lib/admin-action';

type Type = ClassSchedule['type'];

type AdminClassesProps = {
  initialClasses: ClassSchedule[]; // real Supabase rows, fetched via getClasses()
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TYPE_COLORS: Record<Type, string> = {
  wushu: '#C9A84C',
  fitness: '#63B3ED',
};

const EMPTY_FORM = {
  day: 'Monday',
  time: '',
  title: '',
  type: 'wushu' as Type,
  level: '',
  instructor: '',
  durationMinutes: '' as string | number,
};

export default function AdminClasses({ initialClasses }: AdminClassesProps) {
  const [classes, setClasses] = useState<ClassSchedule[]>(initialClasses);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterDay, setFilterDay] = useState<string>('all');
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = filterDay === 'all'
    ? classes
    : classes.filter((c) => c.day === filterDay);

  const sortedByDayTime = [...filtered].sort((a, b) => {
    const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.time.localeCompare(b.time);
  });

  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setSaveError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEditForm(cls: ClassSchedule) {
    setForm({
      day: cls.day,
      time: cls.time,
      title: cls.title,
      type: cls.type,
      level: cls.level ?? '',
      instructor: cls.instructor ?? '',
      durationMinutes: cls.durationMinutes,
    });
    setEditId(cls.id);
    setSaveError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    if (!form.title.trim() || !form.time.trim() || !form.durationMinutes) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        day: form.day,
        time: form.time.trim(),
        title: form.title.trim(),
        type: form.type,
        level: form.level.trim() || null,
        instructor: form.instructor.trim() || null,
        durationMinutes: Number(form.durationMinutes),
      };

      if (editId) {
        const { class: updated } = await updateClass(editId, payload);
        setClasses((prev) => prev.map((c) => (c.id === editId ? toClass(updated) : c)));
      } else {
        const { class: created } = await createClass(payload);
        setClasses((prev) => [...prev, toClass(created)]);
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteClass(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete class');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .classes-admin-form {
          background: #111;
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 28px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .form-full { grid-column: 1 / -1; }
        .admin-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 7px;
        }
        .admin-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 12px;
          font-size: 13px; color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: rgba(201,168,76,0.4); }
        .admin-input::placeholder { color: rgba(255,255,255,0.18); }
        .admin-select {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 12px;
          font-size: 13px; color: rgba(255,255,255,0.7);
          font-family: 'Inter', sans-serif;
          outline: none; cursor: pointer;
        }
        .admin-select option { background: #111; color: #fff; }
        .admin-btn-gold {
          background: #C9A84C; color: #111;
          border: none; border-radius: 10px;
          padding: 10px 22px; font-size: 13px;
          font-weight: 700; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background 0.18s;
        }
        .admin-btn-gold:hover:not(:disabled) { background: #d9b85a; }
        .admin-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 22px;
          font-size: 13px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .admin-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
        .admin-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .field-error { font-size: 11px; color: #E74C3C; margin: 6px 0 0; }
        .classes-table-wrap {
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
        }
        .classes-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; }
        .classes-table th {
          text-align: left; padding: 12px 18px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .classes-table td {
          padding: 14px 18px; font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .classes-table tr:last-child td { border-bottom: none; }
        .classes-table tr:hover td { background: rgba(255,255,255,0.02); }
        .tbl-action-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 7px; padding: 5px 12px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: all 0.18s; white-space: nowrap;
        }
        .tbl-action-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
        .tbl-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tbl-action-btn.danger { color: #E74C3C; border-color: rgba(231,76,60,0.25); }
        .tbl-action-btn.danger:hover { background: rgba(231,76,60,0.08); border-color: rgba(231,76,60,0.5); }
        .delete-confirm {
          background: rgba(231,76,60,0.08);
          border: 1px solid rgba(231,76,60,0.25);
          border-radius: 10px; padding: 12px 16px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
        }
        .filter-select {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 8px 14px;
          font-size: 13px; color: rgba(255,255,255,0.6);
          font-family: 'Inter', sans-serif;
          outline: none; cursor: pointer;
        }
        @media (max-width: 700px) {
          .form-grid { grid-template-columns: 1fr; }
          .classes-table th:nth-child(5),
          .classes-table td:nth-child(5) { display: none; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 22,
            fontWeight: 700, color: '#fff', margin: '0 0 4px 0',
          }}>
            Classes & Schedule
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.35)', margin: 0,
          }}>
            {classes.length} classes across the week
          </p>
        </div>
        <button className="admin-btn-gold" onClick={openAddForm}>+ Add Class</button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="classes-admin-form">
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            fontWeight: 600, color: '#C9A84C',
            margin: '0 0 20px 0', letterSpacing: '0.05em',
          }}>
            {editId ? 'Edit Class' : 'Add New Class'}
          </p>

          <div className="form-grid">
            <div>
              <label className="admin-label">Day</label>
              <select
                className="admin-select"
                value={form.day}
                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="admin-label">Time</label>
              <input
                className="admin-input"
                placeholder="e.g. 6:00 AM"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>

            <div>
              <label className="admin-label">Class Name</label>
              <input
                className="admin-input"
                placeholder="e.g. Wushu"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="admin-label">Type</label>
              <select
                className="admin-select"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Type }))}
              >
                <option value="wushu">Wushu</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Level (optional)</label>
              <input
                className="admin-input"
                placeholder="e.g. Beginner, Advanced"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              />
            </div>

            <div>
              <label className="admin-label">Instructor (optional)</label>
              <input
                className="admin-input"
                placeholder="e.g. Master Endale"
                value={form.instructor}
                onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
              />
            </div>

            <div>
              <label className="admin-label">Duration (minutes)</label>
              <input
                className="admin-input"
                type="number"
                placeholder="e.g. 60"
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="admin-btn-gold"
              onClick={handleSave}
              disabled={!form.title.trim() || !form.time.trim() || !form.durationMinutes || saving}
            >
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Class'}
            </button>
            <button
              className="admin-btn-ghost"
              onClick={() => { setShowForm(false); setEditId(null); }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
          {saveError && <p className="field-error">{saveError}</p>}
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          className="filter-select"
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
        >
          <option value="all">All Days</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="classes-table-wrap">
        <table className="classes-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Class</th>
              <th>Type</th>
              <th>Level</th>
              <th>Instructor</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedByDayTime.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                  No classes found
                </td>
              </tr>
            ) : sortedByDayTime.map((cls) => (
              <React.Fragment key={cls.id}>
                <tr>
                  <td>{cls.day}</td>
                  <td>{cls.time}</td>
                  <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{cls.title}</td>
                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: TYPE_COLORS[cls.type],
                      background: `${TYPE_COLORS[cls.type]}18`,
                      border: `0.5px solid ${TYPE_COLORS[cls.type]}40`,
                      borderRadius: 100, padding: '3px 9px',
                      textTransform: 'capitalize',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {cls.type}
                    </span>
                  </td>
                  <td>{cls.level ?? '—'}</td>
                  <td>{cls.instructor ?? '—'}</td>
                  <td>{cls.durationMinutes} min</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="tbl-action-btn" onClick={() => openEditForm(cls)}>Edit</button>
                      <button
                        className="tbl-action-btn danger"
                        onClick={() => setDeleteConfirm(deleteConfirm === cls.id ? null : cls.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {deleteConfirm === cls.id && (
                  <tr>
                    <td colSpan={8} style={{ padding: '0 18px 14px', background: 'transparent' }}>
                      <div className="delete-confirm">
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#E74C3C', margin: 0 }}>
                          Delete &quot;{cls.title}&quot; ({cls.day} {cls.time})? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="tbl-action-btn danger"
                            onClick={() => handleDelete(cls.id)}
                            disabled={deleting === cls.id}
                            style={{ background: 'rgba(231,76,60,0.15)' }}
                          >
                            {deleting === cls.id ? 'Deleting...' : 'Yes, delete'}
                          </button>
                          <button
                            className="tbl-action-btn"
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting === cls.id}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Converts the API response's snake_case shape into the ClassSchedule type.
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