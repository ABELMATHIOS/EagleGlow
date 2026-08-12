'use client';

import { useState } from 'react';
import { Tutorial, TutorialCategory } from '@/src/types';
import { TUTORIALS as SHARED_TUTORIALS } from '@/src/data/tutorials';
import { BELTS as SHARED_BELTS, getBeltById, getBeltBySlug } from '@/src/data/belts';

const BELT_NAMES = SHARED_BELTS.map((b) => b.name);
const BELT_COLORS: Record<string, string> = Object.fromEntries(SHARED_BELTS.map((b) => [b.name, b.color]));
const CATEGORIES: TutorialCategory[] = ['general', 'taolu', 'kicks', 'sanda', 'gymnastics', 'flexibility'];

function formatDuration(minutes?: number): string {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:00` : `${m}:00`;
}

function youtubeIdFromUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : trimmed; // allow pasting a bare video ID too
}

function makeId(beltSlug: string) {
  return `${beltSlug}-${Date.now().toString(36).slice(-5)}`;
}

type Draft = {
  beltName: string;
  title: string;
  category: TutorialCategory;
  durationMinutes: string;
  videoUrl: string;
  description: string;
  published: boolean;
};

const EMPTY_DRAFT: Draft = {
  beltName: BELT_NAMES[0],
  title: '',
  category: 'general',
  durationMinutes: '',
  videoUrl: '',
  description: '',
  published: true,
};

export default function AdminTutorials() {
  // Mock data — seeded from the shared tutorial list (src/data/tutorials.ts).
  // Held in local state so Add/Edit/Delete actually work; edits only persist
  // for this session until wired to a real backend.
  const [tutorials, setTutorials] = useState<Tutorial[]>(SHARED_TUTORIALS);
  const [filterBelt, setFilterBelt] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const rows = tutorials.map((t) => ({
    id: t.id,
    belt: getBeltById(t.beltId)!.name,
    title: t.title,
    duration: formatDuration(t.durationMinutes),
    published: t.published,
  }));

  const filtered = filterBelt === 'all' ? rows : rows.filter((t) => t.belt === filterBelt);
  const selectedTutorial = tutorials.find((t) => t.id === selected);
  const showForm = adding || Boolean(selectedTutorial);

  const startAdd = () => {
    setDraft(EMPTY_DRAFT);
    setSelected(null);
    setAdding(true);
  };

  const startEdit = (id: string) => {
    const t = tutorials.find((tt) => tt.id === id);
    if (!t) return;
    setDraft({
      beltName: getBeltById(t.beltId)!.name,
      title: t.title,
      category: t.category,
      durationMinutes: t.durationMinutes != null ? String(t.durationMinutes) : '',
      videoUrl: t.videoUrl ?? '',
      description: t.description ?? '',
      published: t.published,
    });
    setSelected(id);
    setAdding(false);
  };

  const cancelForm = () => {
    setAdding(false);
    setSelected(null);
  };

  const draftValid = draft.title.trim().length > 0;

  const saveDraft = () => {
    if (!draftValid) return;
    const belt = SHARED_BELTS.find((b) => b.name === draft.beltName)!;
    const videoId = youtubeIdFromUrl(draft.videoUrl);

    const patch: Partial<Tutorial> = {
      title: draft.title.trim(),
      beltId: belt.id,
      category: draft.category,
      durationMinutes: draft.durationMinutes ? Number(draft.durationMinutes) : undefined,
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
      description: draft.description.trim() || undefined,
      published: draft.published,
    };

    if (selected) {
      setTutorials((prev) => prev.map((t) => (t.id === selected ? { ...t, ...patch } : t)));
    } else {
      const siblingCount = tutorials.filter((t) => t.beltId === belt.id).length;
      setTutorials((prev) => [
        ...prev,
        {
          id: makeId(belt.slug),
          order: siblingCount + 1,
          createdAt: new Date().toISOString().slice(0, 10),
          ...patch,
        } as Tutorial,
      ]);
    }
    setAdding(false);
    setSelected(null);
  };

  const deleteTutorial = (id: string) => {
    setTutorials((prev) => prev.filter((t) => t.id !== id));
    if (selected === id) setSelected(null);
  };

  const togglePublished = (id: string) => {
    setTutorials((prev) => prev.map((t) => (t.id === id ? { ...t, published: !t.published } : t)));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .tutorials-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          align-items: start;
        }
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
          white-space: nowrap;
        }
        .tut-table td {
          padding: 13px 18px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          white-space: nowrap;
        }
        .tut-table tr:last-child td { border-bottom: none; }
        .tut-table tr:hover td { background: rgba(255,255,255,0.02); }
        .tut-table tr.row-selected td { background: rgba(201,168,76,0.05); }
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
        .admin-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12.5px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          width: 100%;
          min-height: 60px;
          resize: vertical;
          box-sizing: border-box;
        }
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
        .admin-select option {
          background: #111;
          color: #fff;
        }
        .admin-btn-gold {
          background: #C9A84C; color: #111;
          border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 13px;
          font-weight: 700; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background 0.18s;
        }
        .admin-btn-gold:hover:not(:disabled) { background: #d9b85a; }
        .admin-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
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
        .row-action-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: '4px 10px';
          font-size: 11px; color: rgba(255,255,255,0.5);
          cursor: pointer; font-family: 'Inter', sans-serif;
        }
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
        .checkbox-row {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif; font-size: 12.5px;
          color: rgba(255,255,255,0.6);
        }
        @media (max-width: 1000px) {
          .tutorials-layout { grid-template-columns: 1fr; }
          .detail-panel { position: static; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12,
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
            {rows.length} videos · {rows.filter((t) => t.published).length} published
          </p>
        </div>
        <button className="admin-btn-gold" onClick={startAdd}>+ Add Tutorial</button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          className="admin-select"
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="all">All Belts</option>
          {BELT_NAMES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="tutorials-layout">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                    No tutorials found
                  </td>
                </tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className={selected === t.id ? 'row-selected' : ''}>
                  <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{t.title}</td>
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
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{t.duration}</td>
                  <td>
                    <span
                      onClick={() => togglePublished(t.id)}
                      style={{
                        cursor: 'pointer',
                        fontSize: 11, fontWeight: 600,
                        color: t.published ? '#2ECC71' : 'rgba(255,255,255,0.3)',
                        background: t.published ? '#2ECC7118' : 'rgba(255,255,255,0.04)',
                        border: `0.5px solid ${t.published ? '#2ECC7140' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 100, padding: '2px 9px',
                      }}
                      title="Click to toggle"
                    >
                      {t.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="row-action-btn" onClick={() => startEdit(t.id)}>Edit</button>
                      <button
                        className="row-action-btn"
                        style={{ borderColor: 'rgba(231,76,60,0.3)', color: '#E74C3C' }}
                        onClick={() => deleteTutorial(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
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
                Select a tutorial to edit, or add a new one
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>
                {selected ? 'Edit Tutorial' : 'New Tutorial'}
              </p>

              <div>
                <label className="field-label">Belt</label>
                <select className="admin-select" value={draft.beltName} onChange={(e) => setDraft((d) => ({ ...d, beltName: e.target.value }))}>
                  {BELT_NAMES.map((b) => <option key={b} value={b}>{b} Belt</option>)}
                </select>
              </div>

              <div>
                <label className="field-label">Title</label>
                <input className="admin-input" placeholder="Tutorial title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              </div>

              <div>
                <label className="field-label">Category</label>
                <select className="admin-select" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as TutorialCategory }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="field-label">Duration (minutes) — optional</label>
                <input className="admin-input" type="number" min={0} placeholder="Leave blank if in-person only" value={draft.durationMinutes} onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: e.target.value }))} />
              </div>

              <div>
                <label className="field-label">YouTube URL or Video ID — optional</label>
                <input
                  className="admin-input"
                  placeholder="https://youtube.com/watch?v=... or just the ID"
                  value={draft.videoUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, videoUrl: e.target.value }))}
                />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
                  Leave blank for tutorials the instructor teaches in person.
                </p>
              </div>

              <div>
                <label className="field-label">Description — optional</label>
                <textarea className="admin-textarea" placeholder="What this tutorial covers" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={draft.published} onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))} />
                Published (visible to members)
              </label>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="admin-btn-gold" style={{ flex: 1 }} disabled={!draftValid} onClick={saveDraft}>
                  {selected ? 'Save Changes' : 'Add Tutorial'}
                </button>
                <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={cancelForm}>Cancel</button>
              </div>

              {selected && (
                <button className="admin-btn-danger" style={{ width: '100%' }} onClick={() => deleteTutorial(selected)}>
                  Delete Tutorial
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}