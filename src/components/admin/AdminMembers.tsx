'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminNote, NameCorrectionRequest, Status, RegistrationType, User, Belt } from '@/src/types';
import { approveUser, promoteBelt, updateMemberStatus, reviewNameCorrection } from '@/src/lib/admin-action';

// This admin view keeps its own flat shape (fullName/belt-as-name instead of
// name/beltId) because that's what this screen's filtering and CSV export
// key off — but beltId is carried alongside belt (name) so promotion writes
// a real Supabase belt_id instead of a display string. The underlying
// records now come from real Supabase data (fetched server-side via
// getAllMembers() + getBelts() and passed in as props) instead of mock data
// — see toMembers() below.
type Member = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registrationType: RegistrationType;
  previousBelt: string;
  yearJoined: string;
  gapReason: string;
  emergencyName: string;
  emergencyPhone: string;
  healthNotes: string;
  adminNotes: AdminNote[];
  nameCorrectionRequest: NameCorrectionRequest | null;
  beltId: string;
  belt: string;
  status: Status;
  registeredAt: string;
};

type AdminMembersProps = {
  initialMembers: User[];
  belts: Belt[]; // real Supabase belts, already sorted by `order` ascending
};

// Converts the real User rows (from getAllMembers()) into this screen's flat
// Member shape. `belts` is the real Supabase belt list (order ascending) —
// used to resolve belt_id -> display name/color instead of the old mock
// src/data/belts.ts, whose fake ids ("belt-1"..) didn't match real FKs.
function toMembers(users: User[], belts: Belt[]): Member[] {
  const beltById = new Map(belts.map((b) => [b.id, b]));
  const fallbackBelt = belts[0];
  return users.map((u) => {
    const belt = (u.beltId && beltById.get(u.beltId)) || fallbackBelt;
    return {
      id: u.id,
      fullName: u.name,
      email: u.email,
      phone: u.phone ?? '',
      registrationType: u.registrationType,
      previousBelt: u.previousBelt ?? '',
      yearJoined: u.yearJoined ?? '',
      gapReason: u.gapReason ?? '',
      emergencyName: u.emergencyContactName ?? '',
      emergencyPhone: u.emergencyContactPhone ?? '',
      healthNotes: u.healthNotes ?? '',
      adminNotes: u.adminNotes,
      nameCorrectionRequest: u.nameCorrectionRequest,
      beltId: belt?.id ?? '',
      belt: belt?.name ?? 'White',
      status: u.status,
      registeredAt: u.createdAt,
    };
  });
}

const registrationTypeLabel: Record<Member['registrationType'], string> = {
  new: 'New',
  training: 'Currently Training',
  returning: 'Returning',
};

const STATUS_COLORS: Record<Member['status'], string> = {
  pending:   '#E74C3C',
  active:    '#2ECC71',
  graduated: '#3498DB',
  serving:   '#9B59B6',
  paused:    '#F39C12',
  withdrawn: 'rgba(255,255,255,0.4)',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

// Every field, in export order. Health notes included intentionally — keep the
// downloaded file somewhere only the coach/admin controls.
const CSV_COLUMNS: { header: string; get: (m: Member) => string }[] = [
  { header: 'Full Name',               get: (m) => m.fullName },
  { header: 'Email',                   get: (m) => m.email },
  { header: 'Phone',                   get: (m) => m.phone },
  { header: 'Current Belt',            get: (m) => m.belt },
  { header: 'Year Joined (if known)',  get: (m) => m.yearJoined },
  { header: 'Emergency Contact Name',  get: (m) => m.emergencyName },
  { header: 'Emergency Contact Phone', get: (m) => m.emergencyPhone },
  { header: 'Health / Medical Notes',  get: (m) => m.healthNotes },
  { header: 'Registered On',           get: (m) => m.registeredAt },
];

export default function AdminMembers({ initialMembers, belts }: AdminMembersProps) {
  const [members,       setMembers]       = useState<Member[]>(() => toMembers(initialMembers, belts));
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterBelt,    setFilterBelt]    = useState('all');
  const [selected,      setSelected]      = useState<string | null>(null);
  const [promoting,     setPromoting]     = useState(false);
  const [promoteTarget, setPromoteTarget] = useState(''); // belt id, not name
  const beltById = new Map(belts.map((b) => [b.id, b]));
  const beltByName = new Map(belts.map((b) => [b.name, b]));

  // Real: calls PATCH /api/admin/users/[id]/belt. Mirrors approveMember's
  // loading/error pattern below.
  const [promotingSave, setPromotingSave] = useState<string | null>(null); // member id currently saving
  const [promoteError,  setPromoteError]  = useState<string | null>(null);

  // Real: calls PATCH /api/admin/users/[id]/status. Shared by Decline,
  // Suspend, Reactivate, and Mark Serving — all just status transitions.
  const [statusSaving, setStatusSaving] = useState<string | null>(null); // member id currently saving
  const [statusError,  setStatusError]  = useState<string | null>(null);

  // Approve action — the only real (Supabase-backed) action on this page so far.
  const [approving,    setApproving]    = useState<string | null>(null); // member id currently being approved
  const [approveError, setApproveError] = useState<string | null>(null);

  // Contact-info inline editing (per selected member)
  const [editingContact, setEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState({ email: '', phone: '', emergencyName: '', emergencyPhone: '' });

  // Admin notes — new entry composer
  const [newNote, setNewNote] = useState('');

  const [correctionSaving, setCorrectionSaving] = useState<string | null>(null);
  const [correctionError,  setCorrectionError]  = useState<string | null>(null);
  const filtered = members.filter((m) => {
    const matchSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchBelt   = filterBelt   === 'all' || m.belt   === filterBelt;
    return matchSearch && matchStatus && matchBelt;
  });

  const selectedMember = members.find((m) => m.id === selected);

  const updateMember = (id: string, patch: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const selectMember = (id: string) => {
    const isSame = id === selected;
    setSelected(isSame ? null : id);
    setPromoting(false);
    setEditingContact(false);
    setNewNote('');
    setApproveError(null);
    setPromoteError(null);
    setStatusError(null);
    if (!isSame) {
      const m = members.find((mm) => mm.id === id);
      if (m) setContactDraft({ email: m.email, phone: m.phone, emergencyName: m.emergencyName, emergencyPhone: m.emergencyPhone });
    }
  };

  // ── Actions ──

  // Real: calls the Supabase-backed approve endpoint (POST
  // /api/admin/users/[id]/approve), which flips status → active, role →
  // member server-side. Local state only updates after that succeeds.
  const approveMember = async (id: string) => {
    setApproving(id);
    setApproveError(null);
    try {
      await approveUser(id);
      updateMember(id, { status: 'active' });
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : 'Failed to approve member');
    } finally {
      setApproving(null);
    }
  };

  // Real: all four call PATCH /api/admin/users/[id]/status. Local state
  // only updates after the request succeeds.
  const setMemberStatus = async (id: string, status: Member['status']) => {
    setStatusSaving(id);
    setStatusError(null);
    try {
      await updateMemberStatus(id, status);
      updateMember(id, { status });
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusSaving(null);
    }
  };

  const declineMember    = (id: string) => setMemberStatus(id, 'withdrawn');
  const reactivateMember = (id: string) => setMemberStatus(id, 'active');
  const suspendMember    = (id: string) => setMemberStatus(id, 'paused');
  const markServing      = (id: string) => setMemberStatus(id, 'serving');

  const startPromote = (currentBeltId: string) => {
    const idx = belts.findIndex((b) => b.id === currentBeltId);
    const next = idx >= 0 ? belts[idx + 1] : undefined;
    setPromoteTarget(next?.id ?? '');
    setPromoteError(null);
    setPromoting(true);
  };

  // Real: calls PATCH /api/admin/users/[id]/belt, which writes the real
  // belt_id server-side and flips status -> graduated if this is the
  // highest-order belt. Local state only updates after that succeeds.
  const confirmPromote = async (id: string) => {
    if (!promoteTarget) return;
    setPromotingSave(id);
    setPromoteError(null);
    try {
      await promoteBelt(id, promoteTarget);
      const newBelt = beltById.get(promoteTarget);
      const isTopBelt = belts.length > 0 && belts[belts.length - 1].id === promoteTarget;
      const patch: Partial<Member> = { beltId: promoteTarget, belt: newBelt?.name ?? '' };
      if (isTopBelt) patch.status = 'graduated';
      updateMember(id, patch);
      setPromoting(false);
    } catch (err) {
      setPromoteError(err instanceof Error ? err.message : 'Failed to update belt');
    } finally {
      setPromotingSave(null);
    }
  };

  const contactValid = EMAIL_RE.test(contactDraft.email) && PHONE_RE.test(contactDraft.phone) && PHONE_RE.test(contactDraft.emergencyPhone);

  const startEditContact = () => {
    if (!selectedMember) return;
    setContactDraft({
      email: selectedMember.email, phone: selectedMember.phone,
      emergencyName: selectedMember.emergencyName, emergencyPhone: selectedMember.emergencyPhone,
    });
    setEditingContact(true);
  };
  const cancelEditContact = () => setEditingContact(false);
  const saveEditContact = (id: string) => {
    if (!contactValid) return;
    updateMember(id, { ...contactDraft });
    setEditingContact(false);
  };

  const addAdminNote = (id: string) => {
    const text = newNote.trim();
    if (!text || !selectedMember) return;
    const entry: AdminNote = { id: `n${Date.now()}`, date: new Date().toISOString().slice(0, 10), note: text };
    updateMember(id, { adminNotes: [entry, ...selectedMember.adminNotes] });
    setNewNote('');
  };

  const approveNameCorrection = async (id: string) => {
    if (!selectedMember?.nameCorrectionRequest) return;
    setCorrectionSaving(id);
    setCorrectionError(null);
    try {
      await reviewNameCorrection(id, 'approve');
      updateMember(id, { fullName: selectedMember.nameCorrectionRequest.requestedName, nameCorrectionRequest: null });
    } catch (err) {
      setCorrectionError(err instanceof Error ? err.message : 'Failed to approve correction');
    } finally {
      setCorrectionSaving(null);
    }
  };

  const rejectNameCorrection = async (id: string) => {
    setCorrectionSaving(id);
    setCorrectionError(null);
    try {
      await reviewNameCorrection(id, 'reject');
      updateMember(id, { nameCorrectionRequest: null });
    } catch (err) {
      setCorrectionError(err instanceof Error ? err.message : 'Failed to reject correction');
    } finally {
      setCorrectionSaving(null);
    }
  };
  const handleExport = () => {
    if (filtered.length === 0) return;
    const headerRow = CSV_COLUMNS.map((c) => c.header).join(',');
    const dataRows = filtered.map((m) =>
      CSV_COLUMNS.map((c) => `"${c.get(m).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eagleglow-members-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

 const handleExportPDF = () => {
    if (filtered.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text('EagleGlow Members', 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated ${dateStr} — ${filtered.length} members`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [CSV_COLUMNS.map((c) => c.header)],
      body: filtered.map((m) => CSV_COLUMNS.map((c) => c.get(m) || '—')),
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [201, 168, 76], textColor: [17, 17, 17], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 7: { cellWidth: 55 } }, // Health / Medical Notes column — give it room to wrap
    });

    doc.save(`eagleglow-members-${dateStr}.pdf`);
  };

  const pendingCorrectionCount = members.filter((m) => m.nameCorrectionRequest).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .members-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          align-items: start;
        }
        .members-table-wrap {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .members-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
        }
        .members-table th {
          text-align: left;
          padding: 12px 18px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em; text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .members-table td {
          padding: 13px 18px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          white-space: nowrap;
        }
        .members-table tr:last-child td { border-bottom: none; }
        .members-table tr { cursor: pointer; }
        .members-table tr:hover td { background: rgba(255,255,255,0.02); }
        .members-table tr.row-selected td { background: rgba(201,168,76,0.05); }

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
        }
        .admin-input:focus { border-color: rgba(201,168,76,0.4); }
        .admin-input::placeholder { color: rgba(255,255,255,0.2); }
        .admin-input.invalid { border-color: #E74C3C; }
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
        .admin-textarea {
          background: #111;
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
          transition: border-color 0.2s;
        }
        .admin-textarea:focus { border-color: rgba(201,168,76,0.4); }
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
        .admin-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
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
        .field-error { font-size: 11px; color: #E74C3C; margin: 6px 0 0; }
        .detail-panel {
          background: #111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 22px;
          position: sticky;
          top: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .detail-row span:first-child {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .detail-row span:last-child {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          text-align: right;
        }
        .section-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin: 0 0 10px;
        }
        @media (max-width: 1000px) {
          .members-layout { grid-template-columns: 1fr; }
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
          }}>Members</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,0.35)', margin: 0,
          }}>
            {members.length} total · {members.filter(m => m.status === 'pending').length} pending
            {pendingCorrectionCount > 0 && <> · {pendingCorrectionCount} name correction{pendingCorrectionCount !== 1 ? 's' : ''} to review</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="admin-btn-ghost" onClick={handleExportPDF}>
            🖨 Export as PDF
          </button>
          <button className="admin-btn-gold" onClick={handleExport}>
            ⬇ Export to CSV
          </button>
        </div>
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: 11.5,
        color: 'rgba(255,255,255,0.3)', marginBottom: 20, lineHeight: 1.6,
      }}>
        Exports include health/medical notes. Keep the downloaded file somewhere
        only you (the coach/admin) control.
      </p>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="admin-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="admin-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="serving">Serving</option>
          <option value="paused">Paused</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <select
          className="admin-select"
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
        >
          <option value="all">All Belts</option>
          {belts.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
      </div>

      <div className="members-layout">
        {/* Table */}
        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Belt</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 0' }}>
                    No members found
                  </td>
                </tr>
              ) : filtered.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => selectMember(m.id)}
                  className={selected === m.id ? 'row-selected' : ''}
                >
                  <td style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {m.fullName}
                      {m.healthNotes && <span title={m.healthNotes} style={{ fontSize: 11 }}>⚕</span>}
                      {m.nameCorrectionRequest && <span title="Name correction pending review" style={{ fontSize: 11 }}>✎</span>}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: beltByName.get(m.belt)?.color,
                        border: m.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        flexShrink: 0,
                      }} />
                      {m.belt}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: STATUS_COLORS[m.status],
                      background: `${STATUS_COLORS[m.status]}18`,
                      border: `0.5px solid ${STATUS_COLORS[m.status]}40`,
                      borderRadius: 100, padding: '2px 9px',
                      textTransform: 'capitalize',
                    }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                    {m.registeredAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        <div className="detail-panel">
          {!selectedMember ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.2)', margin: 0,
              }}>
                Select a member to view details
              </p>
            </div>
          ) : (
            <div>
              {/* Member info */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#C9A84C',
                  fontFamily: 'Inter, sans-serif', flexShrink: 0,
                }}>
                  {selectedMember.fullName[0]}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 14,
                    fontWeight: 600, color: '#fff', margin: '0 0 2px 0',
                  }}>
                    {selectedMember.fullName}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                    color: 'rgba(255,255,255,0.3)', margin: 0,
                  }}>
                    {selectedMember.email}
                  </p>
                </div>
              </div>

              {/* ── Name correction request — review flow ── */}
              {selectedMember.nameCorrectionRequest && (
                <div style={{
                  marginBottom: 20, padding: '12px 14px',
                  background: 'rgba(201,168,76,0.08)',
                  border: '0.5px solid rgba(201,168,76,0.3)',
                  borderRadius: 10,
                }}>
                  <p className="section-label" style={{ color: '#C9A84C', margin: '0 0 8px' }}>✎ Name Correction Requested</p>
                  <div className="detail-row"><span>Current</span><span>{selectedMember.fullName}</span></div>
                  <div className="detail-row"><span>Requested</span><span style={{ color: '#C9A84C', fontWeight: 600 }}>{selectedMember.nameCorrectionRequest.requestedName}</span></div>
                  {selectedMember.nameCorrectionRequest.note && (
                    <div className="detail-row"><span>Note</span><span>{selectedMember.nameCorrectionRequest.note}</span></div>
                  )}
                  <div className="detail-row" style={{ marginBottom: 12 }}><span>Submitted</span><span>{selectedMember.nameCorrectionRequest.submittedAt}</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn-gold" style={{ flex: 1 }} onClick={() => approveNameCorrection(selectedMember.id)} disabled={correctionSaving === selectedMember.id}>
                      {correctionSaving === selectedMember.id ? 'Saving...' : 'Approve'}
                    </button>
                    <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => rejectNameCorrection(selectedMember.id)} disabled={correctionSaving === selectedMember.id}>
                      {correctionSaving === selectedMember.id ? 'Saving...' : 'Reject'}
                    </button>
                  </div>
                  {correctionError && <p className="field-error">{correctionError}</p>}
                </div>
              )}

              {/* Core info */}
              <div className="detail-row"><span>Registered</span><span>{selectedMember.registeredAt}</span></div>
              <div className="detail-row"><span>Registration Type</span><span>{registrationTypeLabel[selectedMember.registrationType]}</span></div>
              {selectedMember.previousBelt && (
                <div className="detail-row"><span>Previous Belt</span><span>{selectedMember.previousBelt}{selectedMember.yearJoined ? ` (joined ${selectedMember.yearJoined})` : ''}</span></div>
              )}
              {selectedMember.gapReason && (
                <div className="detail-row"><span>Gap Reason</span><span>{selectedMember.gapReason}</span></div>
              )}

             {/* Belt */}
              <div className="detail-row" style={{ alignItems: 'center', marginBottom: 12 }}>
                <span>Belt</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: beltByName.get(selectedMember.belt)?.color,
                    border: selectedMember.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  }} />
                  {selectedMember.belt}
                </span>
              </div>

              {/* ── Contact info — editable ── */}
              <div style={{
                marginBottom: 20, paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p className="section-label" style={{ margin: 0 }}>Contact Info</p>
                  {!editingContact && (
                    <button className="admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={startEditContact}>Edit</button>
                  )}
                </div>

                {!editingContact ? (
                  <>
                    <div className="detail-row"><span>Email</span><span>{selectedMember.email}</span></div>
                    <div className="detail-row" style={{ marginBottom: 0 }}><span>Phone</span><span>{selectedMember.phone}</span></div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <input
                        className={`admin-input${contactDraft.email && !EMAIL_RE.test(contactDraft.email) ? ' invalid' : ''}`}
                        style={{ width: '100%' }}
                        value={contactDraft.email}
                        onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))}
                        placeholder="Email"
                      />
                      {contactDraft.email && !EMAIL_RE.test(contactDraft.email) && <p className="field-error">Enter a valid email.</p>}
                    </div>
                    <div>
                      <input
                        className={`admin-input${contactDraft.phone && !PHONE_RE.test(contactDraft.phone) ? ' invalid' : ''}`}
                        style={{ width: '100%' }}
                        value={contactDraft.phone}
                        onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
                        placeholder="Phone"
                      />
                      {contactDraft.phone && !PHONE_RE.test(contactDraft.phone) && <p className="field-error">Enter a valid phone number.</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency contact — editable together with contact info */}
              <div style={{
                marginBottom: 20, paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p className="section-label">Emergency Contact</p>
                {!editingContact ? (
                  <>
                    <div className="detail-row"><span>Name</span><span>{selectedMember.emergencyName}</span></div>
                    <div className="detail-row" style={{ marginBottom: 0 }}><span>Phone</span><span>{selectedMember.emergencyPhone}</span></div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      className="admin-input"
                      style={{ width: '100%' }}
                      value={contactDraft.emergencyName}
                      onChange={(e) => setContactDraft((d) => ({ ...d, emergencyName: e.target.value }))}
                      placeholder="Emergency contact name"
                    />
                    <div>
                      <input
                        className={`admin-input${contactDraft.emergencyPhone && !PHONE_RE.test(contactDraft.emergencyPhone) ? ' invalid' : ''}`}
                        style={{ width: '100%' }}
                        value={contactDraft.emergencyPhone}
                        onChange={(e) => setContactDraft((d) => ({ ...d, emergencyPhone: e.target.value }))}
                        placeholder="Emergency contact phone"
                      />
                      {contactDraft.emergencyPhone && !PHONE_RE.test(contactDraft.emergencyPhone) && <p className="field-error">Enter a valid phone number.</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-btn-gold" style={{ flex: 1 }} onClick={() => saveEditContact(selectedMember.id)} disabled={!contactValid}>Save</button>
                      <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={cancelEditContact}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Health notes */}
              {selectedMember.healthNotes && (
                <div style={{
                  marginBottom: 20, padding: '10px 12px',
                  background: 'rgba(231,76,60,0.08)',
                  border: '0.5px solid rgba(231,76,60,0.25)',
                  borderRadius: 10,
                }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 10,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#E74C3C', margin: '0 0 4px',
                  }}>⚕ Health / Medical Note</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 12,
                    color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5,
                  }}>{selectedMember.healthNotes}</p>
                </div>
              )}

              {/* ── Admin notes — running dated log ── */}
              <div style={{
                marginBottom: 20, paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p className="section-label">Admin Notes</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <textarea
                    className="admin-textarea"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note — attendance, conversations, anything worth tracking over time"
                  />
                  <button
                    className="admin-btn-gold"
                    style={{ alignSelf: 'flex-start' }}
                    disabled={!newNote.trim()}
                    onClick={() => addAdminNote(selectedMember.id)}
                  >
                    Add Note
                  </button>
                </div>

                {selectedMember.adminNotes.length > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedMember.adminNotes.map((n) => (
                      <div key={n.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid rgba(255,255,255,0.06)',
                        borderRadius: 8, padding: '8px 10px',
                      }}>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>{n.date}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{n.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Pending — Approve or Decline */}
                {selectedMember.status === 'pending' && (
                  <>
                    <button
                      className="admin-btn-gold"
                      style={{ width: '100%' }}
                      onClick={() => approveMember(selectedMember.id)}
                      disabled={approving === selectedMember.id}
                    >
                      {approving === selectedMember.id ? 'Approving...' : '✓ Approve Member'}
                    </button>
                    {approveError && <p className="field-error">{approveError}</p>}
                    <button
                      className="admin-btn-danger"
                      style={{ width: '100%' }}
                      onClick={() => declineMember(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Declining...' : '✕ Decline Registration'}
                    </button>
                  </>
                )}

                {/* Active — Promote belt */}
                {selectedMember.status === 'active' && (
                  <>
                    {!promoting ? (
                      <button
                        className="admin-btn-gold"
                        style={{ width: '100%' }}
                        onClick={() => startPromote(selectedMember.beltId)}
                        disabled={belts.length > 0 && selectedMember.beltId === belts[belts.length - 1].id}
                      >
                        ↑ Promote Belt
                      </button>
                    ) : (
                      <div>
                        <select
                          className="admin-select"
                          style={{ width: '100%', marginBottom: 8 }}
                          value={promoteTarget}
                          onChange={(e) => setPromoteTarget(e.target.value)}
                        >
                          {belts
                            .slice(belts.findIndex((b) => b.id === selectedMember.beltId) + 1)
                            .map((b, i, arr) => (
                              <option key={b.id} value={b.id}>
                                {b.name} Belt{i === arr.length - 1 ? ' — auto-marks Graduated' : ''}
                              </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="admin-btn-gold"
                            style={{ flex: 1 }}
                            onClick={() => confirmPromote(selectedMember.id)}
                            disabled={promotingSave === selectedMember.id}
                          >
                            {promotingSave === selectedMember.id ? 'Saving...' : 'Confirm'}
                          </button>
                          <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => setPromoting(false)}>Cancel</button>
                        </div>
                        {promoteError && <p className="field-error">{promoteError}</p>}
                      </div>
                    )}
                    <button
                      className="admin-btn-ghost"
                      style={{ width: '100%' }}
                      onClick={() => suspendMember(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Saving...' : 'Suspend Member'}
                    </button>
                  </>
                )}

                {/* Graduated — offer Serving */}
                {selectedMember.status === 'graduated' && (
                  <button
                    className="admin-btn-gold"
                    style={{ width: '100%' }}
                    onClick={() => markServing(selectedMember.id)}
                    disabled={statusSaving === selectedMember.id}
                  >
                    {statusSaving === selectedMember.id ? 'Saving...' : '★ Mark as Serving (Assistant Instructor)'}
                  </button>
                )}

                {/* Serving — can still be suspended if needed */}
                {selectedMember.status === 'serving' && (
                  <button
                    className="admin-btn-ghost"
                    style={{ width: '100%' }}
                    onClick={() => suspendMember(selectedMember.id)}
                    disabled={statusSaving === selectedMember.id}
                  >
                    {statusSaving === selectedMember.id ? 'Saving...' : 'Suspend Member'}
                  </button>
                )}

                {/* Paused — Reactivate */}
                {selectedMember.status === 'paused' && (
                  <button
                    className="admin-btn-gold"
                    style={{ width: '100%' }}
                    onClick={() => reactivateMember(selectedMember.id)}
                    disabled={statusSaving === selectedMember.id}
                  >
                    {statusSaving === selectedMember.id ? 'Saving...' : '↺ Reactivate Member'}
                  </button>
                )}

                {/* Withdrawn — Reactivate too, in case it was a mistake */}
                {selectedMember.status === 'withdrawn' && (
                  <button
                    className="admin-btn-ghost"
                    style={{ width: '100%' }}
                    onClick={() => reactivateMember(selectedMember.id)}
                    disabled={statusSaving === selectedMember.id}
                  >
                    {statusSaving === selectedMember.id ? 'Saving...' : '↺ Reactivate Member'}
                  </button>
                )}

                {statusError && <p className="field-error">{statusError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}