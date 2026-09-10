'use client';

import { useState } from 'react';
import type { Discipline } from '@/src/types';
import { createDiscipline, updateDiscipline, deleteDiscipline } from '@/src/lib/admin-action';

type AdminDisciplinesProps = {
  initialDisciplines: Discipline[];
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminDisciplines({ initialDisciplines }: AdminDisciplinesProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>(
    [...initialDisciplines].sort((a, b) => a.order - b.order)
  );
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newOrder, setNewOrder] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createDiscipline({
        name: newName.trim(),
        slug: slugify(newName),
        order: newOrder ? Number(newOrder) : disciplines.length,
        description: newDescription.trim() || undefined,
      });
      setDisciplines((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setNewName('');
      setNewOrder('');
      setNewDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discipline');
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (d: Discipline) => {
    setEditingId(d.id);
    setEditName(d.name);
    setEditOrder(String(d.order));
    setEditDescription(d.description ?? '');
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateDiscipline(id, {
        name: editName.trim(),
        slug: slugify(editName),
        order: Number(editOrder),
        description: editDescription.trim(),
      });
      setDisciplines((prev) =>
        prev.map((d) => (d.id === id ? updated : d)).sort((a, b) => a.order - b.order)
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save discipline');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this discipline? Any videos assigned to it will also be removed.')) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteDiscipline(id);
      setDisciplines((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete discipline');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <style>{`
        .disc-admin-wrap { max-width: 760px; font-family: 'Inter', sans-serif; }
        .disc-section {
          background: #111; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 22px; margin-bottom: 18px;
        }
        .disc-label {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin: 0 0 8px;
        }
        .disc-input, .disc-textarea {
          background: #0b0b0b; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #fff;
          font-family: 'Inter', sans-serif; outline: none; width: 100%;
          box-sizing: border-box; transition: border-color 0.2s;
        }
        .disc-input:focus, .disc-textarea:focus { border-color: rgba(201,168,76,0.4); }
        .disc-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .disc-btn-gold {
          background: #C9A84C; color: #111; border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 12px; font-weight: 700;
          font-family: 'Inter', sans-serif; cursor: pointer; letter-spacing: 0.04em;
        }
        .disc-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
        .disc-btn-ghost {
          background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 8px 16px; font-size: 12px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
        }
        .disc-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .disc-btn-danger {
          background: transparent; color: #E74C3C; border: 1px solid rgba(231,76,60,0.3);
          border-radius: 8px; padding: 6px 10px; font-size: 11px; cursor: pointer;
        }
        .disc-btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }
        .disc-error { font-size: 12px; color: #E74C3C; margin: 8px 0 0; }
        .disc-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .disc-item:last-child { border-bottom: none; }
      `}</style>

      <div className="disc-admin-wrap">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>
          Sanda  Disciplines
        </h1>

        <div className="disc-section">
          <p className="disc-label">Add a Discipline</p>
          <div className="disc-row">
            <input
              className="disc-input"
              placeholder="Name (e.g. Sanda, Conditioning)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="disc-input"
              style={{ maxWidth: 100 }}
              placeholder="Order"
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
            />
          </div>
          <textarea
            className="disc-textarea"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            style={{ marginBottom: 10, minHeight: 60 }}
          />
          <button className="disc-btn-gold" onClick={handleCreate} disabled={!newName.trim() || creating}>
            {creating ? 'Adding...' : 'Add Discipline'}
          </button>
        </div>

        <div className="disc-section">
          <p className="disc-label">Current Disciplines ({disciplines.length})</p>
          {disciplines.length === 0 && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No disciplines added yet.</p>
          )}
          {disciplines.map((d) => (
            <div className="disc-item" key={d.id}>
              {editingId === d.id ? (
                <div style={{ flex: 1 }}>
                  <div className="disc-row">
                    <input className="disc-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input
                      className="disc-input"
                      style={{ maxWidth: 100 }}
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(e.target.value)}
                    />
                  </div>
                  <textarea
                    className="disc-textarea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ marginBottom: 10, minHeight: 50 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="disc-btn-gold" onClick={() => saveEditing(d.id)} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="disc-btn-ghost" onClick={cancelEditing} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p style={{ fontSize: 14, color: '#fff', margin: '0 0 2px', fontWeight: 600 }}>
                      {d.name} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>#{d.order}</span>
                    </p>
                    {d.description && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{d.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="disc-btn-ghost" onClick={() => startEditing(d)}>
                      Edit
                    </button>
                    <button
                      className="disc-btn-danger"
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                    >
                      {deletingId === d.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {error && <p className="disc-error">{error}</p>}
      </div>
    </>
  );
}