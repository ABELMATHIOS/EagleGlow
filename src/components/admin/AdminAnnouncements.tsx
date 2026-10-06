'use client';

'use client';

import { useState } from 'react';
import type { Announcement, Program } from '@/src/types';
import {
  createAnnouncement,
  patchAnnouncement,
  deleteAnnouncement,
  type AnnouncementInput,
} from '@/src/lib/admin-action';
const PROGRAM_LABEL: Record<Program, string> = {
  wushu: 'Wushu',
  fitness: 'Fitness',
  sanda: 'Sanda',
};
const EMPTY: AnnouncementInput = { title: '', content: '', program: null, published: false };

export default function AdminAnnouncements({ initialItems }: { initialItems: Announcement[] }) {
  const [items, setItems] = useState<Announcement[]>(initialItems);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<AnnouncementInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId('new');
    setError(null);
  };
  const openEdit = (a: Announcement) => {
    setForm({ title: a.title, content: a.content, program: a.program, published: a.published });
    setEditingId(a.id);
    setError(null);
  };
  const close = () => {
    setEditingId(null);
    setError(null);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () =>
    run(async () => {
      if (editingId === 'new') {
        const created = await createAnnouncement(form);
        setItems((prev) => [created, ...prev]);
      } else if (editingId) {
        const updated = await patchAnnouncement(editingId, form);
        setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
      close();
    });

  const handleToggle = (a: Announcement) =>
    run(async () => {
      const updated = await patchAnnouncement(a.id, { published: !a.published });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    });

  const handleDelete = (a: Announcement) => {
    if (!window.confirm(`Delete "${a.title}"? This can't be undone.`)) return;
    run(async () => {
      await deleteAnnouncement(a.id);
      setItems((prev) => prev.filter((x) => x.id !== a.id));
    });
  };

  return (
    <>
      <style>{`
        .ann-wrap { max-width: 760px; font-family: 'Inter', sans-serif; }
        .ann-card {
          background: #111; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 18px 22px; margin-bottom: 14px;
        }
        .ann-label {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin: 0 0 8px;
        }
        .ann-input, .ann-textarea, .ann-select {
          background: #0b0b0b; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #fff;
          font-family: 'Inter', sans-serif; outline: none; width: 100%;
          box-sizing: border-box; transition: border-color 0.2s;
        }
        .ann-input:focus, .ann-textarea:focus, .ann-select:focus { border-color: rgba(201,168,76,0.4); }
        .ann-textarea { min-height: 140px; resize: vertical; line-height: 1.7; }
        .ann-btn-gold {
          background: #C9A84C; color: #111; border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif; letter-spacing: 0.04em;
        }
        .ann-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
        .ann-btn-ghost {
          background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .ann-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .ann-btn-danger { color: #E74C3C; border-color: rgba(231,76,60,0.3); }
        .ann-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.5);
        }
        .ann-badge.live { color: #2ECC71; border-color: rgba(46,204,113,0.35); }
        .ann-error { font-size: 12px; color: #E74C3C; margin: 8px 0 0; }
      `}</style>

      <div className="ann-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Announcements</h1>
          {editingId === null && (
            <button className="ann-btn-gold" onClick={openNew}>+ New Announcement</button>
          )}
        </div>

        {editingId !== null && (
          <div className="ann-card">
            <p className="ann-label">Title</p>
            <input
              className="ann-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <p className="ann-label" style={{ marginTop: 16 }}>Message</p>
            <textarea
              className="ann-textarea"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />

            <p className="ann-label" style={{ marginTop: 16 }}>Show to</p>
            <select
              className="ann-select"
              value={form.program ?? ''}
              onChange={(e) =>
                setForm({ ...form, program: (e.target.value || null) as Program | null })
              }
            >
              <option value="">All Programs</option>
              <option value="wushu">Wushu only</option>
              <option value="fitness">Fitness only</option>
              <option value="sanda">Sanda only</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publish immediately (uncheck to save as draft)
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                className="ann-btn-gold"
                onClick={handleSave}
                disabled={busy || !form.title.trim() || !form.content.trim()}
              >
                {busy ? 'Saving...' : 'Save'}
              </button>
              <button className="ann-btn-ghost" onClick={close} disabled={busy}>Cancel</button>
            </div>
            {error && <p className="ann-error">{error}</p>}
          </div>
        )}

        {items.length === 0 && editingId === null && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No announcements yet.</p>
        )}

        {items.map((a) => (
          <div className="ann-card" key={a.id}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <span className={`ann-badge ${a.published ? 'live' : ''}`}>
                {a.published ? 'Published' : 'Draft'}
              </span>
              <span className="ann-badge">
                {a.program ? PROGRAM_LABEL[a.program] : 'All Programs'}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                {new Date(a.createdAt).toLocaleDateString('en-US')}
              </span>
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#fff', fontSize: 15 }}>{a.title}</p>
            <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {a.content}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="ann-btn-ghost" onClick={() => handleToggle(a)} disabled={busy}>
                {a.published ? 'Unpublish' : 'Publish'}
              </button>
              <button className="ann-btn-ghost" onClick={() => openEdit(a)} disabled={busy}>Edit</button>
              <button className="ann-btn-ghost ann-btn-danger" onClick={() => handleDelete(a)} disabled={busy}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {error && editingId === null && <p className="ann-error">{error}</p>}
      </div>
    </>
  );
}