'use client';

import { useState } from 'react';
import { Tutorial, TutorialCategory, Belt } from '@/src/types';
import { createTutorial, updateTutorial, deleteTutorial as deleteTutorialAction } from '@/src/lib/admin-action';

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

type Draft = {
  beltId: string;
  title: string;
  category: TutorialCategory;
  durationMinutes: string;
  videoUrl: string;
  description: string;
  published: boolean;
};

type AdminTutorialsProps = {
  initialTutorials: Tutorial[]; // real Supabase tutorials, fetched via getAllTutorials()
  belts: Belt[]; // real Supabase belts, already sorted by `order` ascending
};

export default function AdminTutorials({ initialTutorials, belts }: AdminTutorialsProps) {
  const beltById = new Map(belts.map((b) => [b.id, b]));
  const BELT_COLORS: Record<string, string> = Object.fromEntries(belts.map((b) => [b.name, b.color]));

  const EMPTY_DRAFT: Draft = {
    beltId: belts[0]?.id ?? '',
    title: '',
    category: 'general',
    durationMinutes: '',
    videoUrl: '',
    description: '',
    published: true,
  };

  const [tutorials,     setTutorials]     = useState<Tutorial[]>(initialTutorials);
  const [filterBelt,    setFilterBelt]    = useState('all');
  const [selected,      setSelected]      = useState<string | null>(null);
  const [adding,        setAdding]        = useState(false);
  const [draft,         setDraft]         = useState<Draft>(EMPTY_DRAFT);

  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [togglingId,    setTogglingId]    = useState<string | null>(null);

  const rows = tutorials.map((t) => ({
    id: t.id,
    belt: beltById.get(t.beltId)?.name ?? 'Unknown',
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
    setSaveError(null);
    setAdding(true);
  };

  const startEdit = (id: string) => {
    const t = tutorials.find((tt) => tt.id === id);
    if (!t) return;
    setDraft({
      beltId: t.beltId,
      title: t.title,
      category: t.category,
      durationMinutes: t.durationMinutes != null ? String(t.durationMinutes) : '',
      videoUrl: t.videoUrl ?? '',
      description: t.description ?? '',
      published: t.published,
    });
    setSelected(id);
    setSaveError(null);
    setAdding(false);
  };

  const cancelForm = () => {
    setAdding(false);
    setSelected(null);
  };

  const draftValid = draft.title.trim().length > 0 && Boolean(draft.beltId);

  async function saveDraft() {
    if (!draftValid) return;
    setSaving(true);
    setSaveError(null);
    try {
      const videoId = youtubeIdFromUrl(draft.videoUrl);

      const payload = {
        beltId: draft.beltId,
        title: draft.title.trim(),
        category: draft.category,
        durationMinutes: draft.durationMinutes ? Number(draft.durationMinutes) : null,
        videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
        description: draft.description.trim() || null,
        published: draft.published,
      };

      if (selected) {
        const { tutorial } = await updateTutorial(selected, payload);
        setTutorials((prev) => prev.map((t) => (t.id === selected ? toTutorial(tutorial) : t)));
      } else {
        const siblingCount = tutorials.filter((t) => t.beltId === draft.beltId).length;
        const { tutorial } = await createTutorial({ ...payload, order: siblingCount + 1 });
        setTutorials((prev) => [...prev, toTutorial(tutorial)]);
      }

      setAdding(false);
      setSelected(null);
      setDraft(EMPTY_DRAFT);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save tutorial');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteTutorialAction(id);
      setTutorials((prev) => prev.filter((t) => t.id !== id));
      if (selected === id) setSelected(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete tutorial');
    } finally {
      setDeletingId(null);
    }
  }

  async function togglePublished(id: string) {
    const t = tutorials.find((tt) => tt.id === id);
    if (!t) return;
    setTogglingId(id);
    try {
      const { tutorial } = await updateTutorial(id, { published: !t.published });
      setTutorials((prev) => prev.map((tt) => (tt.id === id ? toTutorial(tutorial) : tt)));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update tutorial');
    } finally {
      setTogglingId(null);
    }
  }

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
        .row-action-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 4px 10px;
          font-size: 11px; color: rgba(255,255,255,0.5);
          cursor: pointer; font-family: 'Inter', sans-serif;
        }
        .row-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
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
        .field-error { font-size: 11px; color: #E74C3C; margin: 4px 0 0; }
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
          {belts.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
      </div>

      {saveError && !showForm && <p className="field-error" style={{ marginBottom: 16 }}>{saveError}</p>}

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
                        cursor: togglingId === t.id ? 'default' : 'pointer',
                        opacity: togglingId === t.id ? 0.5 : 1,
                        fontSize: 11, fontWeight: 600,
                        color: t.published ? '#2ECC71' : 'rgba(255,255,255,0.3)',
                        background: t.published ? '#2ECC7118' : 'rgba(255,255,255,0.04)',
                        border: `0.5px solid ${t.published ? '#2ECC7140' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 100, padding: '2px 9px',
                      }}
                      title="Click to toggle"
                    >
                      {togglingId === t.id ? 'Saving...' : t.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="row-action-btn" onClick={() => startEdit(t.id)}>Edit</button>
                      <button
                        className="row-action-btn"
                        style={{ borderColor: 'rgba(231,76,60,0.3)', color: '#E74C3C' }}
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                      >
                        {deletingId === t.id ? 'Deleting...' : 'Delete'}
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
                <select className="admin-select" value={draft.beltId} onChange={(e) => setDraft((d) => ({ ...d, beltId: e.target.value }))}>
                  {belts.map((b) => <option key={b.id} value={b.id}>{b.name} Belt</option>)}
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
                <button className="admin-btn-gold" style={{ flex: 1 }} disabled={!draftValid || saving} onClick={saveDraft}>
                  {saving ? 'Saving...' : selected ? 'Save Changes' : 'Add Tutorial'}
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
                  {deletingId === selected ? 'Deleting...' : 'Delete Tutorial'}
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
// tutorials API routes) into the Tutorial type this component uses everywhere.
function toTutorial(raw: any): Tutorial {
  return {
    id: raw.id,
    beltId: raw.belt_id,
    title: raw.title,
    description: raw.description ?? undefined,
    videoUrl: raw.video_url ?? undefined,
    durationMinutes: raw.duration_minutes ?? undefined,
    category: raw.category,
    order: raw.sort_order,
    published: raw.published ?? false,
    createdAt: raw.created_at,
  };
}