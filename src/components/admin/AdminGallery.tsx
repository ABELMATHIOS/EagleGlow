'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { GalleryAlbum } from '@/src/types';
import { createAlbum, updateAlbum, deleteAlbum } from '@/src/lib/admin-action';
import { uploadGalleryPhoto, deleteGalleryPhotos } from '@/src/lib/gallery-upload';

type Category = GalleryAlbum['category'];
type Album = GalleryAlbum;

type AdminGalleryProps = {
  initialAlbums: Album[]; // real Supabase albums, fetched via getAllAlbums()
};

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
  previews:  [] as string[], // uploaded Storage URLs, up to 3
};

export default function AdminGallery({ initialAlbums }: AdminGalleryProps) {
  const [albums,        setAlbums]        = useState<Album[]>(initialAlbums);
  const [showForm,      setShowForm]      = useState(false);
  const [editId,        setEditId]        = useState<string | null>(null);
  const [filterCat,     setFilterCat]     = useState<string>('all');
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Real: form save/delete now hit Supabase instead of only local state.
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [togglingId,   setTogglingId]   = useState<string | null>(null);

  // Real: photo upload — uploads to Supabase Storage immediately on file
  // select, per the "upload on pick, not on save" decision.
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterCat === 'all'
    ? albums
    : albums.filter((a) => a.category === filterCat);

  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setSaveError(null);
    setUploadError(null);
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
      previews:  album.previews ?? [],
    });
    setEditId(album.id);
    setSaveError(null);
    setUploadError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Uploads immediately on select — the form field just holds whatever
  // Storage URLs have been uploaded so far (max 3).
  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.previews.length >= 3) {
      setUploadError('Maximum 3 preview photos per album.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadGalleryPhoto(file, form.category);
      setForm((f) => ({ ...f, previews: [...f.previews, url] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removePreview(url: string) {
    // Only removes it from the form's pending list — the file itself stays
    // in Storage (harmless orphan) unless/until a cleanup job is added.
    setForm((f) => ({ ...f, previews: f.previews.filter((p) => p !== url) }));
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        category:    form.category,
        title:       form.title.trim(),
        subtitle:    form.subtitle.trim(),
        albumUrl:    form.albumUrl.trim()  || null,
        youtubeId:   form.youtubeId.trim() || null,
        videoOnly:   form.videoOnly,
        published:   form.published,
        previewUrls: form.previews,
      };

      if (editId) {
        const { album } = await updateAlbum(editId, payload);
        setAlbums((prev) => prev.map((a) => (a.id === editId ? toAlbum(album) : a)));
      } else {
        const { album } = await createAlbum(payload);
        setAlbums((prev) => [toAlbum(album), ...prev]);
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save album');
    } finally {
      setSaving(false);
    }
  }

 async function handleDelete(id: string) {
  setDeleting(id);
  try {
    const album = albums.find((a) => a.id === id);
    await deleteAlbum(id);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);

    if (album?.previews?.length) {
      deleteGalleryPhotos(album.previews).catch((err) => {
        console.error('Failed to clean up storage files for deleted album:', err);
      });
    }
  } catch (err) {
    setSaveError(err instanceof Error ? err.message : 'Failed to delete album');
  } finally {
    setDeleting(null);
  }
}
  async function togglePublish(album: Album) {
    setTogglingId(album.id);
    try {
      const { album: updated } = await updateAlbum(album.id, { published: !album.published });
      setAlbums((prev) => prev.map((a) => (a.id === album.id ? toAlbum(updated) : a)));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update album');
    } finally {
      setTogglingId(null);
    }
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
        .admin-select option {
          background: #111;
          color: #fff;
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
        .admin-btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
        }
        .admin-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .field-error { font-size: 11px; color: #E74C3C; margin: 6px 0 0; }
        .upload-strip { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .upload-thumb {
          width: 64px; height: 64px; border-radius: 10px;
          overflow: hidden; position: relative;
          background: #1a1a1a; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .upload-thumb-remove {
          position: absolute; top: 2px; right: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(0,0,0,0.7); color: #fff;
          border: none; cursor: pointer;
          font-size: 11px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .upload-slot {
          width: 64px; height: 64px; border-radius: 10px;
          border: 1px dashed rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          color: rgba(255,255,255,0.3); font-size: 20px;
          transition: border-color 0.18s, color 0.18s;
        }
        .upload-slot:hover { border-color: rgba(201,168,76,0.4); color: #C9A84C; }
        .upload-slot.disabled { opacity: 0.4; cursor: not-allowed; }
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
        .tbl-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
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
        .toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
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

          {/* ── Sample photos — real upload, independent of album URL / video ── */}
          {!form.videoOnly && (
            <div style={{ marginBottom: 20 }}>
              <label className="admin-label">Sample Photos (optional, up to 3)</label>
              <div className="upload-strip">
                {form.previews.map((url) => (
                  <div key={url} className="upload-thumb">
                    <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
                    <button
                      type="button"
                      className="upload-thumb-remove"
                      onClick={() => removePreview(url)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {form.previews.length < 3 && (
                  <div
                    className={`upload-slot${uploading ? ' disabled' : ''}`}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    title="Add photo"
                  >
                    {uploading ? '…' : '+'}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </div>
              {uploadError && <p className="field-error">{uploadError}</p>}
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 11,
                color: 'rgba(255,255,255,0.25)', margin: '8px 0 0',
              }}>
                Uploads immediately to storage. These can stand alone as the album&apos;s
                content, or sit alongside a Google Photos link and/or video — all independent.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="admin-btn-gold"
              onClick={handleSave}
              disabled={!form.title.trim() || saving}
            >
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Album'}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                  No albums found
                </td>
              </tr>
            ) : filtered.map((album) => (
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
                            />
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
                      onClick={() => togglePublish(album)}
                      disabled={togglingId === album.id}
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
                      {togglingId === album.id ? 'Saving...' : album.published ? 'Published' : 'Draft'}
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
                            disabled={deleting === album.id}
                            style={{ background: 'rgba(231,76,60,0.15)' }}
                          >
                            {deleting === album.id ? 'Deleting...' : 'Yes, delete'}
                          </button>
                          <button
                            className="tbl-action-btn"
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting === album.id}
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

// Converts the API response's snake_case-adjacent shape (already normalized
// by the get-all-albums / create / update routes) into the GalleryAlbum type
// this component uses everywhere else.
function toAlbum(raw: any): Album {
  return {
    id: raw.id,
    category: raw.category,
    title: raw.title,
    subtitle: raw.subtitle ?? '',
    albumUrl: raw.album_url ?? null,
    youtubeId: raw.youtube_id ?? null,
    videoOnly: raw.video_only ?? false,
    previews: raw.preview_urls ?? [],
    published: raw.published ?? false,
  };
}