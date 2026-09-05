'use client';

import { useState } from 'react';
import type { RulesContent } from '@/src/lib/rules';
import { updateRules } from '@/src/lib/admin-action';

type AdminRulesProps = {
  initialContent: RulesContent;
};

export default function AdminRules({ initialContent }: AdminRulesProps) {
  const [content, setContent] = useState<RulesContent>(initialContent);
  const [saved, setSaved] = useState<RulesContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = content.title !== saved.title || content.content !== saved.content;

  const setField = <K extends 'title' | 'content'>(key: K, value: string) => {
    setJustSaved(false);
    setContent((c) => ({ ...c, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRules({ title: content.title, content: content.content });
      setSaved(updated);
      setContent(updated);
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setContent(saved);
    setError(null);
    setJustSaved(false);
  };

  return (
    <>
      <style>{`
        .rules-admin-wrap { max-width: 760px; font-family: 'Inter', sans-serif; }
        .rules-section {
          background: #111; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 22px; margin-bottom: 18px;
        }
        .rules-label {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin: 0 0 8px;
        }
        .rules-input, .rules-textarea {
          background: #0b0b0b; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #fff;
          font-family: 'Inter', sans-serif; outline: none; width: 100%;
          box-sizing: border-box; transition: border-color 0.2s;
        }
        .rules-input:focus, .rules-textarea:focus { border-color: rgba(201,168,76,0.4); }
        .rules-textarea { min-height: 420px; resize: vertical; line-height: 1.7; }
        .rules-btn-gold {
          background: #C9A84C; color: #111; border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 12px; font-weight: 700;
          font-family: 'Inter', sans-serif; cursor: pointer; letter-spacing: 0.04em;
        }
        .rules-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
        .rules-btn-ghost {
          background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 10px 20px; font-size: 12px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
        }
        .rules-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .rules-error { font-size: 12px; color: #E74C3C; margin: 8px 0 0; }
        .rules-success { font-size: 12px; color: #2ECC71; margin: 8px 0 0; }
      `}</style>

      <div className="rules-admin-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Rules & Regulations</h1>
          {content.updatedAt && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              Last updated {new Date(content.updatedAt).toLocaleDateString('en-US')}
            </span>
          )}
        </div>

        <div className="rules-section">
          <p className="rules-label">Title</p>
          <input
            className="rules-input"
            value={content.title}
            onChange={(e) => setField('title', e.target.value)}
          />
        </div>

        <div className="rules-section">
          <p className="rules-label">Rules Content</p>
          <textarea
            className="rules-textarea"
            value={content.content}
            onChange={(e) => setField('content', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="rules-btn-gold" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {isDirty && (
            <button className="rules-btn-ghost" onClick={handleDiscard} disabled={saving}>
              Discard
            </button>
          )}
        </div>
        {error && <p className="rules-error">{error}</p>}
        {justSaved && !isDirty && <p className="rules-success">Saved.</p>}
      </div>
    </>
  );
}