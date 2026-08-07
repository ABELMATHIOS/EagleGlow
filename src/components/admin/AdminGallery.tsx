'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────
type Category = 'graduation' | 'competition' | 'training';

interface Album {
  id:        string;
  category:  Category;
  title:     string;
  subtitle:  string;
  albumUrl:  string | null;
  youtubeId: string | null;
  videoOnly: boolean;
  published: boolean;
  previews:  string[];
}

// ── Mock data ─────────────────────────────────────────────────
const INITIAL_ALBUMS: Album[] = [
  {
    id: 'grad-2025', category: 'graduation',
    title: '2025 / 2017 E.C.', subtitle: 'Graduation Ceremony',
    albumUrl: null, youtubeId: null,
    videoOnly: false, published: true,
    previews: [
      '/images/gallery/graduation/2025/preview-1.jpg',
      '/images/gallery/graduation/2025/preview-2.jpg',
      '/images/gallery/graduation/2025/preview-3.jpg',
    ],
  },
  {
    id: 'grad-2023', category: 'graduation',
    title: '2023 / 2015 E.C.', subtitle: 'Graduation Ceremony',
    albumUrl: null, youtubeId: null,
    videoOnly: true, published: true,
    previews: [],
  },
  {
    id: 'grad-2022', category: 'graduation',
    title: '2022 / 2014 E.C.', subtitle: 'Graduation Ceremony',
    albumUrl: null, youtubeId: null,
    videoOnly: false, published: true,
    previews: [
      '/images/gallery/graduation/2022/preview-1.jpg',
      '/images/gallery/graduation/2022/preview-2.jpg',
      '/images/gallery/graduation/2022/preview-3.jpg',
    ],
  },
  {
    id: 'grad-2020', category: 'graduation',
    title: '2020 / 2012 E.C.', subtitle: 'Graduation Ceremony',
    albumUrl: null, youtubeId: null,
    videoOnly: false, published: true,
    previews: [
      '/images/gallery/graduation/2020/preview-1.jpg',
      '/images/gallery/graduation/2020/preview-2.jpg',
      '/images/gallery/graduation/2020/preview-3.jpg',
    ],
  },
  {
    id: 'grad-2017', category: 'graduation',
    title: '2017 / 2009 E.C.', subtitle: 'Graduation Ceremony',
    albumUrl: null, youtubeId: null,
    videoOnly: false, published: true,
    previews: [
      '/images/gallery/graduation/2017/preview-1.jpg',
      '/images/gallery/graduation/2017/preview-2.jpg',
      '/images/gallery/graduation/2017/preview-3.jpg',
    ],
  },
  {
    id: 'comp-2025', category: 'competition',
    title: '2025 / 2017 E.C.', subtitle: 'Competition',
    albumUrl: null, youtubeId: null,
    videoOnly: false, published: true,
    previews: [
      '/images/gallery/competition/2025/preview-1.jpg',
      '/images/gallery/competition/2025/preview-2.jpg',
      '/images/gallery/competition/2025/preview-3.jpg',
    ],
  },
  {
    id: 'training', category: 'training',
    title: 'Training Memories & Moments', subtitle: '2012 / 2004 E.C.',
    albumUrl: null, youtubeId: null,
    videoOnly: false, published: true,
    previews: [
      '/images/gallery/training/preview-1.jpg',
      '/images/gallery/training/preview-2.jpg',
      '/images/gallery/training/preview-3.jpg',
    ],
  },
];

const CATEGORY_COLORS: Record<Category, string> = {
  graduation:  '#C9A84C',
  competition: '#3498DB',
  training:    '#2ECC71',
};

const EMPTY_FORM = {
  category:  'graduation' as Category,
  title:     '',
  subtitle:  '',
  albumUrl:  '',
  youtubeId: '',
  videoOnly: false,
  published: false,
};

export default function AdminGallery() {
  const [albums,        setAlbums]        = useState<Album[]>(INITIAL_ALBUMS);
  const [showForm,      setShowForm]      = useState(false);
  const [editId,        setEditId]        = useState<string | null>(null);
  const [filterCat,     setFilterCat]     = useState<string>('all');
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = filterCat === 'all'
    ? albums
    : albums.filter((a) => a.category === filterCat);

  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEditForm(album: Album) {
    setForm({
      category:  album.category,
      title:     album.title,
      subtitle:  album.subtitle,
      albumUrl:  album.albumUrl  ?? '',
      youtubeId: album.youtubeId ?? '',
      videoOnly: album.videoOnly,
      published: album.published,
    });
    setEditId(album.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSave() {
    if (!form.title.trim()) return;
    if (editId) {
      setAlbums((prev) => prev.map((a) =>
        a.id === editId ? {
          ...a,
          category:  form.category,
          title:     form.title.trim(),
          subtitle:  form.subtitle.trim(),
          albumUrl:  form.albumUrl.trim()  || null,
          youtubeId: form.youtubeId.trim() || null,
          videoOnly: form.videoOnly,
          published: form.published,
        } : a
      ));
    } else {
      const newAlbum: Album = {
        id:        `${form.category}-${Date.now()}`,
        category:  form.category,
        title:     form.title.trim(),
        subtitle:  form.subtitle.trim(),
        albumUrl:  form.albumUrl.trim()  || null,
        youtubeId: form.youtubeId.trim() || null,
        videoOnly: form.videoOnly,
        published: form.published,
        previews:  [],
      };
      setAlbums((prev) => [newAlbum, ...prev]);
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id: string) {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  }

  function togglePublish(id: string) {
    setAlbums((prev) => prev.map((a) =>
      a.id === id ? { ...a, published: !a.published } : a
    ));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .gallery-admin-form {
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
        .admin-checkbox-row {
          display: flex; align-items: center;
          gap: 10px; cursor: pointer;
        }
        .admin-checkbox {
          width: 16px; height: 16px;
          accent-color: #C9A84C; cursor: pointer;
        }
        .admin-checkbox-label {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.6);
        }
        .admin-btn-gold {
          background: #C9A84C; color: #111;
          border: none; border-radius: 10px;
          padding: 10px 22px; font-size: 13px;
          font-weight: 700; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background 0.18s;
        }
        .admin-btn-gold:hover { background: #d9b85a; }
        .admin-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 22px;
          font-size: 13px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .admin-btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
        }
        .gallery-table-wrap {
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
        }
        .gallery-table {
          width: 100%; border-collapse: collapse;
          font-family: 'Inter', sans-serif;
        }
        .gallery-table th {
          text-align: left; padding: 12px 18px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .gallery-table td {
          padding: 14px 18px; font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .gallery-table tr:last-child td { border-bottom: none; }
        .gallery-table tr:hover td { background: rgba(255,255,255,0.02); }
        .preview-strip { display: flex; gap: 4px; }
        .preview-thumb {
          width: 36px; height: 36px; border-radius: 6px;
          overflow: hidden; position: relative;
          background: #1a1a1a; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .tbl-action-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 7px; padding: 5px 12px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: all 0.18s; white-space: nowrap;
        }
        .tbl-action-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
        }
        .tbl-action-btn.danger {
          color: #E74C3C;
          border-color: rgba(231,76,60,0.25);
        }
        .tbl-action-btn.danger:hover {
          background: rgba(231,76,60,0.08);
          border-color: rgba(231,76,60,0.5);
        }
        .delete-confirm {
          background: rgba(231,76,60,0.08);
          border: 1px solid rgba(231,76,60,0.25);
          border-radius: 10px; padding: 12px 16px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
        }
        .toggle-btn {
          display: inline-flex; align-items: center;
          gap: 6px; background: transparent; border: none;
          cursor: pointer; font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          transition: all 0.18s; padding: 4px 0;
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
          .gallery-table th:nth-child(4),
          .gallery-table td:nth-child(4) { display: none; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 22,
            fontWeight: 700, color: '#fff', margin: '0 0 4px 0',
          }}>
            Gallery
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.35)', margin: 0,
          }}>
            {albums.length} albums · {albums.filter(a => a.published).length} published
          </p>
        </div>
        <button className="admin-btn-gold" onClick={openAddForm}>
          + Add Album
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="gallery-admin-form">
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            fontWeight: 600, color: '#C9A84C',
            margin: '0 0 20px 0', letterSpacing: '0.05em',
          }}>
            {editId ? 'Edit Album' : 'Add New Album'}
          </p>

          <div className="form-grid">
            <div>
              <label className="admin-label">Category</label>
              <select
                className="admin-select"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              >
                <option value="graduation">Graduation</option>
                <option value="competition">Competition</option>
                <option value="training">Training</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Title (year)</label>
              <input
                className="admin-input"
                placeholder="e.g. 2026 / 2018 E.C."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="admin-label">Subtitle</label>
              <input
                className="admin-input"
                placeholder="e.g. Graduation Ceremony"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </div>

            <div>
              <label className="admin-label">YouTube Video ID (optional)</label>
              <input
                className="admin-input"
                placeholder="e.g. dQw4w9WgXcQ"
                value={form.youtubeId}
                onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
              />
            </div>

            <div className="form-full">
              <label className="admin-label">Google Photos Album URL (optional)</label>
              <input
                className="admin-input"
                placeholder="https://photos.google.com/share/..."
                value={form.albumUrl}
                onChange={(e) => setForm((f) => ({ ...f, albumUrl: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                className="admin-checkbox"
                checked={form.videoOnly}
                onChange={(e) => setForm((f) => ({ ...f, videoOnly: e.target.checked }))}
              />
              <span className="admin-checkbox-label">Video only (no photos)</span>
            </label>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                className="admin-checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              <span className="admin-checkbox-label">Published (visible on site)</span>
            </label>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 20,
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12,
              color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6,
            }}>
              💡 Drop 3 preview images into{' '}
              <code style={{ color: '#C9A84C', fontSize: 11 }}>
                public/images/gallery/{form.category}/{form.title.split('/')[0].trim()}/
              </code>
              {' '}named{' '}
              <code style={{ color: '#C9A84C', fontSize: 11 }}>preview-1.jpg</code>,{' '}
              <code style={{ color: '#C9A84C', fontSize: 11 }}>preview-2.jpg</code>,{' '}
              <code style={{ color: '#C9A84C', fontSize: 11 }}>preview-3.jpg</code>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="admin-btn-gold"
              onClick={handleSave}
              disabled={!form.title.trim()}
              style={{ opacity: form.title.trim() ? 1 : 0.5 }}
            >
              {editId ? 'Save Changes' : 'Add Album'}
            </button>
            <button
              className="admin-btn-ghost"
              onClick={() => { setShowForm(false); setEditId(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          className="filter-select"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="graduation">Graduation</option>
          <option value="competition">Competition</option>
          <option value="training">Training</option>
        </select>
      </div>

      {/* Table */}
      <div className="gallery-table-wrap">
        <table className="gallery-table">
          <thead>
            <tr>
              <th>Album</th>
              <th>Category</th>
              <th>Links</th>
              <th>Previews</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((album) => (
              <React.Fragment key={album.id}>

                {/* Main row */}
                <tr>
                  <td>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 13,
                      fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                      margin: '0 0 2px 0',
                    }}>
                      {album.title}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11,
                      color: 'rgba(255,255,255,0.3)', margin: 0,
                    }}>
                      {album.subtitle}
                    </p>
                  </td>

                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: CATEGORY_COLORS[album.category],
                      background: `${CATEGORY_COLORS[album.category]}18`,
                      border: `0.5px solid ${CATEGORY_COLORS[album.category]}40`,
                      borderRadius: 100, padding: '3px 9px',
                      textTransform: 'capitalize',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {album.category}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {album.youtubeId ? (
                        <span style={{
                          fontSize: 11, color: '#E74C3C',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          ▶ YouTube ✓
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11, color: 'rgba(255,255,255,0.2)',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          ▶ No video
                        </span>
                      )}
                      {album.albumUrl ? (
                        <span style={{
                          fontSize: 11, color: '#C9A84C',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          📸 Album ✓
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11, color: 'rgba(255,255,255,0.2)',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          📸 No album
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {album.previews.length > 0 ? (
                      <div className="preview-strip">
                        {album.previews.slice(0, 3).map((src, i) => (
                          <div key={i} className="preview-thumb">
                            <Image
                              src={src} alt=""
                              fill style={{ objectFit: 'cover' }}
                              onError={() => {}}
                            />
                            <div style={{
                              position: 'absolute', inset: 0, zIndex: -1,
                              background: '#1a1a1a',
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12, opacity: 0.3,
                            }}>
                              📸
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{
                        fontSize: 11, color: 'rgba(255,255,255,0.2)',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {album.videoOnly ? 'Video only' : 'No previews'}
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      className="toggle-btn"
                      onClick={() => togglePublish(album.id)}
                      style={{
                        color: album.published
                          ? '#2ECC71'
                          : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: album.published
                          ? '#2ECC71'
                          : 'rgba(255,255,255,0.2)',
                        display: 'inline-block',
                      }} />
                      {album.published ? 'Published' : 'Draft'}
                    </button>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="tbl-action-btn"
                        onClick={() => openEditForm(album)}
                      >
                        Edit
                      </button>
                      <button
                        className="tbl-action-btn danger"
                        onClick={() => setDeleteConfirm(
                          deleteConfirm === album.id ? null : album.id
                        )}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Delete confirm row */}
                {deleteConfirm === album.id && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: '0 18px 14px', background: 'transparent' }}
                    >
                      <div className="delete-confirm">
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 13,
                          color: '#E74C3C', margin: 0,
                        }}>
                          Delete &quot;{album.title}&quot;? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="tbl-action-btn danger"
                            onClick={() => handleDelete(album.id)}
                            style={{ background: 'rgba(231,76,60,0.15)' }}
                          >
                            Yes, delete
                          </button>
                          <button
                            className="tbl-action-btn"
                            onClick={() => setDeleteConfirm(null)}
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