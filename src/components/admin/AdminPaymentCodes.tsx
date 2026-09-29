'use client';

import { useEffect, useMemo, useState } from 'react';

type Member = {
  id: string;
  name: string;
  email: string;
  program: string | null;
  studentCode: string;
};
type Settings = { schoolCode: string; videoUrl: string; instructions: string };

export default function AdminPaymentCodes() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({ schoolCode: '', videoUrl: '', instructions: '' });
  const [savedSettings, setSavedSettings] = useState<Settings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/payment-codes');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load');
        setSettings(json.settings);
        setSavedSettings(json.settings);
        setMembers(json.members);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const settingsDirty =
    settings.schoolCode !== savedSettings.schoolCode ||
    settings.videoUrl !== savedSettings.videoUrl ||
    settings.instructions !== savedSettings.instructions;

  const saveSettings = async () => {
    setSavingSettings(true);
    setSettingsMsg(null);
    try {
      const res = await fetch('/api/admin/payment-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', ...settings }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save');
      setSavedSettings(settings);
      setSettingsMsg({ ok: true, text: 'Saved.' });
    } catch (e) {
      setSettingsMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed to save' });
    } finally {
      setSavingSettings(false);
    }
  };

  const saveStudent = async (m: Member) => {
    const value = (edits[m.id] ?? m.studentCode).trim();
    setSavingId(m.id);
    setRowErrors((r) => ({ ...r, [m.id]: '' }));
    try {
      const res = await fetch('/api/admin/payment-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'student', userId: m.id, studentCode: value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save');
      setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, studentCode: value } : x)));
      setEdits((e) => {
        const { [m.id]: _drop, ...rest } = e;
        return rest;
      });
    } catch (e) {
      setRowErrors((r) => ({ ...r, [m.id]: e instanceof Error ? e.message : 'Failed to save' }));
    } finally {
      setSavingId(null);
    }
  };

  const unassignedCount = members.filter((m) => !m.studentCode).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (onlyUnassigned && m.studentCode) return false;
      if (!q) return true;
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.studentCode.toLowerCase().includes(q)
      );
    });
  }, [members, search, onlyUnassigned]);

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Loading...</p>;
  if (loadError) return <p style={{ color: '#E74C3C', fontSize: 13 }}>{loadError}</p>;

  return (
    <>
      <style>{`
        .pc-wrap { max-width: 900px; font-family: 'Inter', sans-serif; }
        .pc-section { background:#111; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:22px; margin-bottom:18px; }
        .pc-label { font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin:0 0 8px; }
        .pc-input, .pc-textarea { background:#0b0b0b; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; font-size:13px; color:#fff; font-family:'Inter',sans-serif; outline:none; width:100%; box-sizing:border-box; transition:border-color .2s; }
        .pc-input:focus, .pc-textarea:focus { border-color: rgba(201,168,76,0.4); }
        .pc-textarea { min-height:90px; resize:vertical; line-height:1.6; }
        .pc-btn-gold { background:#C9A84C; color:#111; border:none; border-radius:10px; padding:10px 20px; font-size:12px; font-weight:700; cursor:pointer; letter-spacing:0.04em; }
        .pc-btn-gold:disabled { opacity:.4; cursor:not-allowed; }
        .pc-btn-sm { padding:8px 14px; font-size:11px; }
        .pc-row { display:grid; grid-template-columns: 1.6fr 1fr auto; gap:12px; align-items:center; padding:12px 0; border-top:1px solid rgba(255,255,255,0.05); }
        .pc-name { color:#fff; font-size:13px; font-weight:600; margin:0; }
        .pc-sub { color:rgba(255,255,255,0.35); font-size:11px; margin:2px 0 0; }
        .pc-err { font-size:11px; color:#E74C3C; margin:4px 0 0; grid-column: 1 / -1; }
        @media (max-width: 640px) { .pc-row { grid-template-columns: 1fr; } }
      `}</style>

      <div className="pc-wrap">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Payment Codes</h1>

        <div className="pc-section">
          <p className="pc-label">School Code (same for every student)</p>
          <input
            className="pc-input"
            value={settings.schoolCode}
            onChange={(e) => { setSettingsMsg(null); setSettings({ ...settings, schoolCode: e.target.value }); }}
          />
          <p className="pc-label" style={{ marginTop: 16 }}>"How to pay" video (YouTube link)</p>
          <input
            className="pc-input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={settings.videoUrl}
            onChange={(e) => { setSettingsMsg(null); setSettings({ ...settings, videoUrl: e.target.value }); }}
          />
          <p className="pc-label" style={{ marginTop: 16 }}>Instructions shown to students</p>
          <textarea
            className="pc-textarea"
            value={settings.instructions}
            onChange={(e) => { setSettingsMsg(null); setSettings({ ...settings, instructions: e.target.value }); }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button className="pc-btn-gold" onClick={saveSettings} disabled={!settingsDirty || savingSettings}>
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
            {settingsMsg && (
              <span style={{ fontSize: 12, color: settingsMsg.ok ? '#2ECC71' : '#E74C3C' }}>{settingsMsg.text}</span>
            )}
          </div>
        </div>

        <div className="pc-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <p className="pc-label" style={{ margin: 0 }}>Student Codes</p>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {unassignedCount} of {members.length} still need a code
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
            <input
              className="pc-input"
              style={{ maxWidth: 320 }}
              placeholder="Search name, email or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={onlyUnassigned} onChange={(e) => setOnlyUnassigned(e.target.checked)} />
              Only unassigned
            </label>
          </div>

          {visible.length === 0 && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '16px 0 0' }}>No members match.</p>
          )}

          {visible.map((m) => {
            const value = edits[m.id] ?? m.studentCode;
            const dirty = value.trim() !== m.studentCode;
            return (
              <div key={m.id} className="pc-row">
                <div>
                  <p className="pc-name">{m.name}</p>
                  <p className="pc-sub">{m.email}{m.program ? ` · ${m.program}` : ''}</p>
                </div>
                <input
                  className="pc-input"
                  placeholder="Student code"
                  value={value}
                  onChange={(e) => setEdits((ed) => ({ ...ed, [m.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && dirty && savingId !== m.id) saveStudent(m); }}
                />
                <button
                  className="pc-btn-gold pc-btn-sm"
                  disabled={!dirty || savingId === m.id}
                  onClick={() => saveStudent(m)}
                >
                  {savingId === m.id ? 'Saving...' : 'Save'}
                </button>
                {rowErrors[m.id] && <p className="pc-err">{rowErrors[m.id]}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}