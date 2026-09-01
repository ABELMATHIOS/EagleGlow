'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminNote, NameCorrectionRequest, Status, RegistrationType, User, Belt } from '@/src/types';
import { approveUser, promoteBelt, updateMemberStatus, reviewNameCorrection, resetMemberPassword, addMemberNote, deleteMemberNote, setMemberAdminRole, deleteMemberPermanently } from '@/src/lib/admin-action';

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
  role: User['role'];
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
  // The status this member held immediately before being paused — set when
  // Suspend fires, restored (and cleared) when Reactivate fires. Requires a
  // `previous_status` column server-side and a matching `previousStatus`
  // field on the User type (see /src/types) — null for members who've
  // never been paused.
  previousStatus: Status | null;
  registeredAt: string;
  photoUrl: string;
};

type AdminMembersProps = {
  initialMembers: User[];
  belts: Belt[];
  callerRole: User["role"] | null;
  initialAdmins: User[]; // only populated for super_admin callers
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
      role: u.role,
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
      previousStatus: (u as { previousStatus?: Status | null }).previousStatus ?? null,
      registeredAt: u.createdAt,
      photoUrl: u.photoUrl ?? '',
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
  served:    '#1ABC9C',
  paused:    '#F39C12',
  withdrawn: 'rgba(255,255,255,0.4)',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

// Statuses that only make sense when a member is at the top belt — if a
// member in one of these gets downgraded below the top belt, their status
// reverts to 'active' (mirrors the belt route's own server-side logic).
const TOP_BELT_ONLY_STATUSES: Status[] = ['graduated', 'serving', 'served'];

// Every field, in export order. Health notes included intentionally — keep the
// downloaded file somewhere only the coach/admin controls.
const CSV_COLUMNS: { header: string; get: (m: Member) => string }[] = [
  { header: 'Full Name',               get: (m) => m.fullName },
  { header: 'Phone',                   get: (m) => m.phone },
  { header: 'Current Belt',            get: (m) => m.belt },
  { header: 'Year Joined',             get: (m) => m.yearJoined },
  { header: 'Emergency Contact Name',  get: (m) => m.emergencyName },
  { header: 'Emergency Contact Phone', get: (m) => m.emergencyPhone },
  { header: 'Health / Medical Notes',  get: (m) => m.healthNotes },
];

export default function AdminMembers({ initialMembers, belts, callerRole, initialAdmins }: AdminMembersProps) {
  const [members,       setMembers]       = useState<Member[]>(() => toMembers(initialMembers, belts));
  const [admins,         setAdmins]        = useState<Member[]>(() => toMembers(initialAdmins, belts));
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterBelt,    setFilterBelt]    = useState('all');
  const [selected,      setSelected]      = useState<string | null>(null);
  const [promoting,     setPromoting]     = useState(false);
  const [promoteTarget, setPromoteTarget] = useState(''); // belt id, not name
  const beltById = new Map(belts.map((b) => [b.id, b]));
  const beltByName = new Map(belts.map((b) => [b.name, b]));

  // Mirrors the exact logic app/api/admin/users/[id]/approve/route.ts uses
  // to auto-assign a belt on approval — so a pending applicant's "Belt" row
  // shows the truth (what they'll actually get) instead of always showing
  // White, which is just beltId's null-fallback and was misleading admins
  // into thinking White was their real/current status.
  function beltForPendingMember(m: Member): Belt | undefined {
    const isReturning = m.registrationType === 'training' || m.registrationType === 'returning';
    const matched = isReturning ? beltByName.get(m.previousBelt) : undefined;
    return matched ?? belts[0];
  }

  // Real: calls PATCH /api/admin/users/[id]/belt. Mirrors approveMember's
  // loading/error pattern below.
  const [promotingSave, setPromotingSave] = useState<string | null>(null); // member id currently saving
  const [promoteError,  setPromoteError]  = useState<string | null>(null);

  // Downgrade Belt — same underlying endpoint as Promote (it just accepts
  // any beltId), kept as separate state/UI so it reads as a deliberate,
  // distinct action rather than a variant of Promote.
  const [downgrading,      setDowngrading]      = useState(false);
  const [downgradeTarget,  setDowngradeTarget]  = useState(''); // belt id
  const [downgradingSave,  setDowngradingSave]  = useState<string | null>(null);
  const [downgradeError,   setDowngradeError]   = useState<string | null>(null);

  // Real: calls PATCH /api/admin/users/[id]/status. Shared by Withdraw,
  // Suspend, Reactivate, Mark Serving, and End Service — all just status
  // transitions.
  const [statusSaving, setStatusSaving] = useState<string | null>(null); // member id currently saving
  const [statusError,  setStatusError]  = useState<string | null>(null);

  // Approve action — the only real (Supabase-backed) action on this page so far.
  const [approving,    setApproving]    = useState<string | null>(null); // member id currently being approved
  const [approveError, setApproveError] = useState<string | null>(null);

  // Delete Permanently — separate from Decline (which just marks the member
  // 'withdrawn' and keeps their record). This removes the users row AND the
  // Supabase Auth account entirely. Gated behind an inline confirm step so
  // it's never a single accidental click.
  const [deleteConfirming, setDeleteConfirming] = useState(false); // confirm panel open/closed
  const [deletingPermanently, setDeletingPermanently] = useState<string | null>(null); // member id currently deleting
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Contact-info inline editing (per selected member)
  const [editingContact, setEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState({ email: '', phone: '', emergencyName: '', emergencyPhone: '' });

  // Admin notes — new entry composer
  

  const [correctionSaving, setCorrectionSaving] = useState<string | null>(null);
  const [correctionError,  setCorrectionError]  = useState<string | null>(null);

  // Reset Password — admin sets a new password directly (no email sent),
  // for members who forgot theirs and can't use the email-based reset
  // because of the Supabase SMTP rate limit.
  const [resettingPassword, setResettingPassword] = useState(false); // panel open/closed
  const [newPasswordDraft, setNewPasswordDraft] = useState('');
  const [passwordSaving, setPasswordSaving] = useState<string | null>(null); // member id currently saving
  const [passwordError,  setPasswordError]  = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null); // member id just succeeded
  const filtered = members.filter((m) => {
    const matchSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchBelt   = filterBelt   === 'all' || m.belt   === filterBelt;
    return matchSearch && matchStatus && matchBelt;
  });

    const selectedMember = members.find((m) => m.id === selected) ?? admins.find((m) => m.id === selected);

    const updateMember = (id: string, patch: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setAdmins((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const selectMember = (id: string) => {
    const isSame = id === selected;
    setSelected(isSame ? null : id);
    setPromoting(false);
    setDowngrading(false);
    setDowngradeError(null);
    setEditingContact(false);
    setNewNote('');
    setApproveError(null);
    setPromoteError(null);
    setStatusError(null);
    setResettingPassword(false);
    setNewPasswordDraft('');
    setPasswordError(null);
    setPasswordSuccess(null);
    setDeleteConfirming(false);
    setDeleteError(null);
        if (!isSame) {
      const m = members.find((mm) => mm.id === id) ?? admins.find((mm) => mm.id === id);
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

  // Real: all status actions call PATCH /api/admin/users/[id]/status.
  // `previousStatus` is only meaningful when transitioning INTO 'paused' —
  // it's what lets Reactivate restore the member's actual prior status
  // instead of always resetting to 'active'. Local state only updates
  // after the request succeeds.
  const setMemberStatus = async (id: string, status: Member['status'], previousStatus?: Member['status']) => {
    setStatusSaving(id);
    setStatusError(null);
    try {
      await updateMemberStatus(id, status, previousStatus);
      updateMember(id, {
        status,
        // Mirror the route's own clearing rule: only 'paused' keeps a
        // previousStatus value, every other transition clears it.
        previousStatus: status === 'paused' ? (previousStatus ?? null) : null,
      });
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusSaving(null);
    }
  };

  const declineMember  = (id: string) => setMemberStatus(id, 'withdrawn'); // pending -> withdrawn
  const withdrawMember = (id: string) => setMemberStatus(id, 'withdrawn'); // active -> withdrawn
  const markServing    = (id: string) => setMemberStatus(id, 'serving');  // graduated -> serving
  const endService     = (id: string) => setMemberStatus(id, 'served');   // serving -> served

  // Suspend snapshots whatever status the member is in right now, so
  // Reactivate knows what to restore later.
  const suspendMember = (id: string) => {
    const m = members.find((mm) => mm.id === id) ?? admins.find((mm) => mm.id === id);
    if (!m) return;
    setMemberStatus(id, 'paused', m.status);
};

const reactivateMember = (id: string) => {
    const m = members.find((mm) => mm.id === id) ?? admins.find((mm) => mm.id === id);
    const target = m?.previousStatus ?? 'active';
    setMemberStatus(id, target);
};

  // Real: calls DELETE /api/admin/users/[id]. Removes the users row AND the
  // Supabase Auth account entirely — unlike Decline/Withdraw, there's no
  // record left afterward. Removes the member from local state on success.
  const confirmDeletePermanently = async (id: string) => {
    setDeletingPermanently(id);
    setDeleteError(null);
    try {
      await deleteMemberPermanently(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setAdmins((prev) => prev.filter((m) => m.id !== id));
      setSelected(null);
      setDeleteConfirming(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete member');
    } finally {
      setDeletingPermanently(null);
    }
  };

  // Generates something easy to say out loud and retype correctly (two
  // short words + a number), rather than the admin inventing one on the
  // spot. Not meant to be high-entropy — the member is expected to change
  // it themselves from Profile after logging in.
  const generateSimplePassword = () => {
    const words = [
      'tiger', 'eagle', 'dragon', 'crane', 'lotus', 'panda', 'wolf', 'hawk',
      'falcon', 'phoenix', 'maple', 'river', 'cobra', 'storm', 'shadow', 'blaze',
    ];
    const w1 = words[Math.floor(Math.random() * words.length)];
    let w2 = words[Math.floor(Math.random() * words.length)];
    while (w2 === w1) w2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(100 + Math.random() * 900); // 3 digits
    setNewPasswordDraft(`${w1}${w2}${num}`);
    setPasswordError(null);
  };

  // Real: calls POST /api/admin/users/[id]/reset-password. Sets the
  // password directly server-side — no email involved, so no rate limit.
  const confirmResetPassword = async (id: string) => {
    if (newPasswordDraft.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordSaving(id);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await resetMemberPassword(id, newPasswordDraft);
      setPasswordSuccess(id);
      setNewPasswordDraft('');
      setResettingPassword(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setPasswordSaving(null);
    }
  };

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

  // Downgrade Belt — defaults to the belt immediately below the member's
  // current one, same "closest first" convention as Promote.
  const startDowngrade = (currentBeltId: string) => {
    const idx = belts.findIndex((b) => b.id === currentBeltId);
    const lower = idx > 0 ? belts[idx - 1] : undefined;
    setDowngradeTarget(lower?.id ?? '');
    setDowngradeError(null);
    setDowngrading(true);
  };

  // Same PATCH /api/admin/users/[id]/belt endpoint as Promote — the route
  // itself decides the status side-effect (reverting graduated/serving/
  // served back to active when the new belt isn't the top belt). We mirror
  // that same decision here so local state matches what the server did.
  const confirmDowngrade = async (id: string) => {
    if (!downgradeTarget) return;
    setDowngradingSave(id);
    setDowngradeError(null);
    try {
      await promoteBelt(id, downgradeTarget);
      const newBelt = beltById.get(downgradeTarget);
      const isTopBelt = belts.length > 0 && belts[belts.length - 1].id === downgradeTarget;
      const patch: Partial<Member> = { beltId: downgradeTarget, belt: newBelt?.name ?? '' };
      const m = members.find((mm) => mm.id === id);
      if (!isTopBelt && m && TOP_BELT_ONLY_STATUSES.includes(m.status)) {
        patch.status = 'active';
      }
      updateMember(id, patch);
      setDowngrading(false);
    } catch (err) {
      setDowngradeError(err instanceof Error ? err.message : 'Failed to update belt');
    } finally {
      setDowngradingSave(null);
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
    // Admin notes — new entry composer
    // Admin notes — new entry composer
  const [newNote, setNewNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false); // adding a note
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteDeletingId, setNoteDeletingId] = useState<string | null>(null); // note id currently deleting
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
    const addAdminNote = async (id: string) => {
    const text = newNote.trim();
    if (!text || !selectedMember) return;
    setNoteSaving(true);
    setNoteError(null);
    try {
      const { user } = await addMemberNote(id, text);
      updateMember(id, { adminNotes: user.admin_notes ?? [] });
      setNewNote('');
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setNoteSaving(false);
    }
  };

  const deleteAdminNote = async (id: string, noteId: string) => {
    setNoteDeletingId(noteId);
    setNoteError(null);
    try {
      const { user } = await deleteMemberNote(id, noteId);
      updateMember(id, { adminNotes: user.admin_notes ?? [] });
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setNoteDeletingId(null);
    }
  };
      const toggleAdminRole = async (id: string, grant: boolean) => {
    setRoleSaving(true);
    setRoleError(null);
    try {
      const { user } = await setMemberAdminRole(id, grant);
      if (grant) {
        const existing = members.find((m) => m.id === id);
        setMembers((prev) => prev.filter((m) => m.id !== id));
        if (existing) {
          setAdmins((prev) => [{ ...existing, role: user.role, adminNotes: user.admin_notes ?? [] }, ...prev]);
        }
      } else {
        const existing = admins.find((m) => m.id === id);
        setAdmins((prev) => prev.filter((m) => m.id !== id));
        if (existing) {
          setMembers((prev) => [{ ...existing, role: user.role, adminNotes: user.admin_notes ?? [] }, ...prev]);
        }
      }
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Failed to update admin access');
    } finally {
      setRoleSaving(false);
    }
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

  const [exportingPDF, setExportingPDF] = useState(false);

  // Fetches an image (member photo or the site logo) and returns it as a
  // base64 data URL plus its detected format ('JPEG'/'PNG'/etc) — jsPDF's
  // addImage() needs the format as an explicit argument; without it, it
  // silently misreads a coordinate as the format string and draws nothing.
  async function fetchImageForPdf(url: string): Promise<{ dataUrl: string; format: string } | null> {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const match = dataUrl.match(/^data:image\/(\w+);/);
      const format = (match?.[1] ?? 'JPEG').toUpperCase();
      return { dataUrl, format };
    } catch (err) {
      console.error(`Failed to load image for PDF export (${url}):`, err);
      return null;
    }
  }

  // Crops a photo into a circle (transparent corners) via an offscreen
  // canvas, so member photos read as proper ID-style headshots instead of
  // plain squares. Not used for the logo — a square logo mark is fine.
  function cropToCircle(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  const handleExportPDF = async () => {
    if (filtered.length === 0) return;
    setExportingPDF(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const activeBelt = filterBelt !== 'all' ? beltByName.get(filterBelt) : undefined;
      const title = activeBelt ? `${activeBelt.name} belt students` : 'All members';

      // Pre-fetch every image up front (logo + each row's photo), since the
      // per-cell drawing below runs synchronously inside autoTable's hooks
      // and can't await a fetch mid-render.
      const [logo, rawPhotos] = await Promise.all([
        fetchImageForPdf('/images/Eagle-Logo.png'),
        Promise.all(filtered.map((m) => (m.photoUrl ? fetchImageForPdf(m.photoUrl) : Promise.resolve(null)))),
      ]);

      const photos = await Promise.all(
        rawPhotos.map(async (photo) => {
          if (!photo) return null;
          try {
            const circular = await cropToCircle(photo.dataUrl);
            return { dataUrl: circular, format: 'PNG' };
          } catch (err) {
            console.error('Failed to crop photo to circle, using original:', err);
            return photo;
          }
        })
      );

      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      if (logo) {
        try {
          doc.addImage(logo.dataUrl, logo.format, margin, 10, 12, 12);
        } catch (err) {
          console.error('Failed to draw logo in PDF:', err);
        }
      }

      const textX = logo ? margin + 16 : margin;
      doc.setFontSize(15);
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, textX, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`EagleGlow Wushu and Fitness Center — generated ${dateStr} — ${filtered.length} students`, textX, 21.5);

      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.6);
      doc.line(margin, 25, pageWidth - margin, 25);

      const PHOTO_COL = 0;
      const BELT_COL = 3;

      autoTable(doc, {
        startY: 30,
        head: [['', 'Name', 'Phone', 'Belt', 'Joined', 'Emergency Name', 'Emergency Phone', 'Health / Medical Notes']],
        body: filtered.map((m) => [
          '',
          m.fullName,
          m.phone || '—',
          m.belt,
          m.yearJoined || '—',
          m.emergencyName || '—',
          m.emergencyPhone || '—',
          m.healthNotes || '—',
        ]),
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', minCellHeight: 12 },
        headStyles: { fillColor: [201, 168, 76], textColor: [17, 17, 17], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 248, 242] },
        columnStyles: {
          [PHOTO_COL]: { cellWidth: 14 },
          [BELT_COL]: { cellWidth: 22 },
          7: { cellWidth: 55 },
        },
        didDrawCell: (data) => {
          if (data.cell.section !== 'body') return;

          if (data.column.index === PHOTO_COL) {
            const photo = photos[data.row.index];
            if (photo) {
              const size = 8;
              const x = data.cell.x + (data.cell.width - size) / 2;
              const y = data.cell.y + (data.cell.height - size) / 2;
              try {
                doc.addImage(photo.dataUrl, photo.format, x, y, size, size);
              } catch (err) {
                console.error(`Failed to draw photo for row ${data.row.index}:`, err);
              }
            }
          }
        },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
      }

      doc.save(`eagleglow-${activeBelt ? activeBelt.name.toLowerCase() + '-belt-' : ''}members-${dateStr}.pdf`);
    } finally {
      setExportingPDF(false);
    }
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
          <button className="admin-btn-ghost" onClick={handleExportPDF} disabled={exportingPDF}>
            {exportingPDF ? 'Generating…' : '🖨 Export as PDF'}
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
          <option value="served">Served</option>
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
            {callerRole === 'super_admin' && (
        <div style={{
          marginBottom: 20, background: '#111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '16px 18px',
        }}>
          <p className="section-label" style={{ margin: '0 0 10px' }}>
            Admins ({admins.length})
          </p>
          {admins.length === 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              No other admins yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {admins.map((a) => (
                <div
                  key={a.id}
                  onClick={() => selectMember(a.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    background: selected === a.id ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                    border: selected === a.id ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
                    {a.fullName} <span style={{ color: 'rgba(255,255,255,0.35)' }}>· {a.email}</span>
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: a.role === 'super_admin' ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                        background: m.status === 'pending'
                          ? beltForPendingMember(m)?.color
                          : beltByName.get(m.belt)?.color,
                        border: m.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        flexShrink: 0,
                      }} />
                      {m.status === 'pending' ? (beltForPendingMember(m)?.name ?? m.belt) : m.belt}
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
                <span>{selectedMember.status === 'pending' ? 'Belt (on approval)' : 'Belt'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: selectedMember.status === 'pending'
                      ? beltForPendingMember(selectedMember)?.color
                      : beltByName.get(selectedMember.belt)?.color,
                    border: selectedMember.belt === 'White' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  }} />
                  {selectedMember.status === 'pending'
                    ? (beltForPendingMember(selectedMember)?.name ?? selectedMember.belt)
                    : selectedMember.belt}
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
                    disabled={!newNote.trim() || noteSaving}
                    onClick={() => addAdminNote(selectedMember.id)}
                  >
                    {noteSaving ? 'Saving...' : 'Add Note'}
                  </button>
                </div>

                {noteError && <p className="field-error">{noteError}</p>}

                {selectedMember.adminNotes.length > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedMember.adminNotes.map((n) => (
                      <div key={n.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid rgba(255,255,255,0.06)',
                        borderRadius: 8, padding: '8px 10px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>{n.date}</p>
                          <button
                            className="row-action-btn"
                            style={{
                              border: '1px solid rgba(231,76,60,0.3)', color: '#E74C3C',
                              background: 'transparent', borderRadius: 8, padding: '2px 8px',
                              fontSize: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                              flexShrink: 0,
                            }}
                            onClick={() => deleteAdminNote(selectedMember.id, n.id)}
                            disabled={noteDeletingId === n.id}
                          >
                            {noteDeletingId === n.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{n.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Pending — Approve, Decline, or Delete Permanently */}
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

                    {/* Delete Permanently — separate from Decline. Removes the
                        member and their login account entirely, no record kept.
                        Gated behind an inline confirm step. */}
                    {!deleteConfirming ? (
                      <button
                        className="admin-btn-ghost"
                        style={{ width: '100%' }}
                        onClick={() => { setDeleteConfirming(true); setDeleteError(null); }}
                      >
                        🗑 Delete Permanently
                      </button>
                    ) : (
                      <div style={{
                        background: 'rgba(231,76,60,0.08)',
                        border: '0.5px solid rgba(231,76,60,0.3)',
                        borderRadius: 10, padding: '12px 14px',
                      }}>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 12,
                          color: '#E74C3C', margin: '0 0 10px', lineHeight: 1.5,
                        }}>
                          This permanently deletes {selectedMember.fullName}&apos;s account and
                          all their data — no record is kept, and this cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="admin-btn-danger"
                            style={{ flex: 1 }}
                            onClick={() => confirmDeletePermanently(selectedMember.id)}
                            disabled={deletingPermanently === selectedMember.id}
                          >
                            {deletingPermanently === selectedMember.id ? 'Deleting...' : 'Yes, delete permanently'}
                          </button>
                          <button
                            className="admin-btn-ghost"
                            style={{ flex: 1 }}
                            onClick={() => setDeleteConfirming(false)}
                            disabled={deletingPermanently === selectedMember.id}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {deleteError && <p className="field-error">{deleteError}</p>}
                  </>
                )}

                {/* Active — Promote belt, Downgrade belt, Withdraw, Suspend */}
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

                    {/* Downgrade Belt — hidden entirely at White (belts[0]),
                        since there's nothing lower to move to. */}
                    {belts.length > 0 && selectedMember.beltId !== belts[0].id && (
                      !downgrading ? (
                        <button
                          className="admin-btn-ghost"
                          style={{ width: '100%' }}
                          onClick={() => startDowngrade(selectedMember.beltId)}
                        >
                          ↓ Downgrade Belt
                        </button>
                      ) : (
                        <div>
                          <select
                            className="admin-select"
                            style={{ width: '100%', marginBottom: 8 }}
                            value={downgradeTarget}
                            onChange={(e) => setDowngradeTarget(e.target.value)}
                          >
                            {belts
                              .slice(0, belts.findIndex((b) => b.id === selectedMember.beltId))
                              .reverse()
                              .map((b) => (
                                <option key={b.id} value={b.id}>{b.name} Belt</option>
                              ))}
                          </select>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="admin-btn-danger"
                              style={{ flex: 1 }}
                              onClick={() => confirmDowngrade(selectedMember.id)}
                              disabled={downgradingSave === selectedMember.id}
                            >
                              {downgradingSave === selectedMember.id ? 'Saving...' : 'Confirm Downgrade'}
                            </button>
                            <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => setDowngrading(false)}>Cancel</button>
                          </div>
                          {downgradeError && <p className="field-error">{downgradeError}</p>}
                        </div>
                      )
                    )}

                    <button
                      className="admin-btn-ghost"
                      style={{ width: '100%' }}
                      onClick={() => suspendMember(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Saving...' : 'Suspend Member'}
                    </button>
                    <button
                      className="admin-btn-danger"
                      style={{ width: '100%' }}
                      onClick={() => withdrawMember(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Saving...' : '✕ Withdraw Member'}
                    </button>
                  </>
                )}

                {/* Graduated — offer Serving, Downgrade Belt */}
                {selectedMember.status === 'graduated' && (
                  <>
                    <button
                      className="admin-btn-gold"
                      style={{ width: '100%' }}
                      onClick={() => markServing(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Saving...' : '★ Mark as Serving (Assistant Instructor)'}
                    </button>

                    {belts.length > 0 && selectedMember.beltId !== belts[0].id && (
                      !downgrading ? (
                        <button
                          className="admin-btn-ghost"
                          style={{ width: '100%' }}
                          onClick={() => startDowngrade(selectedMember.beltId)}
                        >
                          ↓ Downgrade Belt
                        </button>
                      ) : (
                        <div>
                          <select
                            className="admin-select"
                            style={{ width: '100%', marginBottom: 8 }}
                            value={downgradeTarget}
                            onChange={(e) => setDowngradeTarget(e.target.value)}
                          >
                            {belts
                              .slice(0, belts.findIndex((b) => b.id === selectedMember.beltId))
                              .reverse()
                              .map((b) => (
                                <option key={b.id} value={b.id}>{b.name} Belt</option>
                              ))}
                          </select>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="admin-btn-danger"
                              style={{ flex: 1 }}
                              onClick={() => confirmDowngrade(selectedMember.id)}
                              disabled={downgradingSave === selectedMember.id}
                            >
                              {downgradingSave === selectedMember.id ? 'Saving...' : 'Confirm Downgrade'}
                            </button>
                            <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => setDowngrading(false)}>Cancel</button>
                          </div>
                          {downgradeError && <p className="field-error">{downgradeError}</p>}
                        </div>
                      )
                    )}
                  </>
                )}

                {/* Serving — End Service, Downgrade Belt, or Suspend if needed */}
                {selectedMember.status === 'serving' && (
                  <>
                    <button
                      className="admin-btn-gold"
                      style={{ width: '100%' }}
                      onClick={() => endService(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Saving...' : '● End Service'}
                    </button>

                    {belts.length > 0 && selectedMember.beltId !== belts[0].id && (
                      !downgrading ? (
                        <button
                          className="admin-btn-ghost"
                          style={{ width: '100%' }}
                          onClick={() => startDowngrade(selectedMember.beltId)}
                        >
                          ↓ Downgrade Belt
                        </button>
                      ) : (
                        <div>
                          <select
                            className="admin-select"
                            style={{ width: '100%', marginBottom: 8 }}
                            value={downgradeTarget}
                            onChange={(e) => setDowngradeTarget(e.target.value)}
                          >
                            {belts
                              .slice(0, belts.findIndex((b) => b.id === selectedMember.beltId))
                              .reverse()
                              .map((b) => (
                                <option key={b.id} value={b.id}>{b.name} Belt</option>
                              ))}
                          </select>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="admin-btn-danger"
                              style={{ flex: 1 }}
                              onClick={() => confirmDowngrade(selectedMember.id)}
                              disabled={downgradingSave === selectedMember.id}
                            >
                              {downgradingSave === selectedMember.id ? 'Saving...' : 'Confirm Downgrade'}
                            </button>
                            <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => setDowngrading(false)}>Cancel</button>
                          </div>
                          {downgradeError && <p className="field-error">{downgradeError}</p>}
                        </div>
                      )
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

                {/* Served — deactivated by default; admin can restore access at their
    discretion if they want this member to keep using the tutorials portal.
    Downgrade Belt is also available here, same as Graduated/Serving. */}
{selectedMember.status === 'served' && (
  <>
    <button
      className="admin-btn-ghost"
      style={{ width: '100%' }}
      onClick={() => setMemberStatus(selectedMember.id, 'serving')}
      disabled={statusSaving === selectedMember.id}
    >
      {statusSaving === selectedMember.id ? 'Saving...' : '↺ Restore Access'}
    </button>

    {belts.length > 0 && selectedMember.beltId !== belts[0].id && (
      !downgrading ? (
        <button
          className="admin-btn-ghost"
          style={{ width: '100%' }}
          onClick={() => startDowngrade(selectedMember.beltId)}
        >
          ↓ Downgrade Belt
        </button>
      ) : (
        <div>
          <select
            className="admin-select"
            style={{ width: '100%', marginBottom: 8 }}
            value={downgradeTarget}
            onChange={(e) => setDowngradeTarget(e.target.value)}
          >
            {belts
              .slice(0, belts.findIndex((b) => b.id === selectedMember.beltId))
              .reverse()
              .map((b) => (
                <option key={b.id} value={b.id}>{b.name} Belt</option>
              ))}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="admin-btn-danger"
              style={{ flex: 1 }}
              onClick={() => confirmDowngrade(selectedMember.id)}
              disabled={downgradingSave === selectedMember.id}
            >
              {downgradingSave === selectedMember.id ? 'Saving...' : 'Confirm Downgrade'}
            </button>
            <button className="admin-btn-ghost" style={{ flex: 1 }} onClick={() => setDowngrading(false)}>Cancel</button>
          </div>
          {downgradeError && <p className="field-error">{downgradeError}</p>}
        </div>
      )
    )}
  </>
)}

                {/* Paused — Reactivate (restores whatever status they held
                    before being paused — Active, Serving, etc.) */}
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

                {/* Withdrawn — Reactivate, or Delete Permanently to remove
                    the record entirely */}
                {selectedMember.status === 'withdrawn' && (
                  <>
                    <button
                      className="admin-btn-ghost"
                      style={{ width: '100%' }}
                      onClick={() => reactivateMember(selectedMember.id)}
                      disabled={statusSaving === selectedMember.id}
                    >
                      {statusSaving === selectedMember.id ? 'Saving...' : '↺ Reactivate Member'}
                    </button>

                    {!deleteConfirming ? (
                      <button
                        className="admin-btn-ghost"
                        style={{ width: '100%' }}
                        onClick={() => { setDeleteConfirming(true); setDeleteError(null); }}
                      >
                        🗑 Delete Permanently
                      </button>
                    ) : (
                      <div style={{
                        background: 'rgba(231,76,60,0.08)',
                        border: '0.5px solid rgba(231,76,60,0.3)',
                        borderRadius: 10, padding: '12px 14px',
                      }}>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 12,
                          color: '#E74C3C', margin: '0 0 10px', lineHeight: 1.5,
                        }}>
                          This permanently deletes {selectedMember.fullName}&apos;s account and
                          all their data — no record is kept, and this cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="admin-btn-danger"
                            style={{ flex: 1 }}
                            onClick={() => confirmDeletePermanently(selectedMember.id)}
                            disabled={deletingPermanently === selectedMember.id}
                          >
                            {deletingPermanently === selectedMember.id ? 'Deleting...' : 'Yes, delete permanently'}
                          </button>
                          <button
                            className="admin-btn-ghost"
                            style={{ flex: 1 }}
                            onClick={() => setDeleteConfirming(false)}
                            disabled={deletingPermanently === selectedMember.id}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {deleteError && <p className="field-error">{deleteError}</p>}
                  </>
                )}

                {statusError && <p className="field-error">{statusError}</p>}

                {/* Reset Password — any non-pending member can be helped
                    here, since email-based reset is rate-limited. */}
                {selectedMember.status !== 'pending' && (
                  <div style={{ marginTop: 12 }}>
                    {!resettingPassword ? (
                      <button
                        className="admin-btn-ghost"
                        style={{ width: '100%' }}
                        onClick={() => {
                          setResettingPassword(true);
                          setPasswordError(null);
                          setPasswordSuccess(null);
                        }}
                      >
                        Reset Password
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="New temporary password"
                            value={newPasswordDraft}
                            onChange={(e) => setNewPasswordDraft(e.target.value)}
                            className="admin-input"
                            style={{ flex: 1 }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="admin-btn-ghost"
                            style={{ whiteSpace: 'nowrap' }}
                            onClick={generateSimplePassword}
                          >
                            Generate
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="admin-btn-gold"
                            style={{ flex: 1 }}
                            onClick={() => confirmResetPassword(selectedMember.id)}
                            disabled={passwordSaving === selectedMember.id}
                          >
                            {passwordSaving === selectedMember.id ? 'Saving...' : 'Set Password'}
                          </button>
                          <button
                            className="admin-btn-ghost"
                            style={{ flex: 1 }}
                            onClick={() => {
                              setResettingPassword(false);
                              setNewPasswordDraft('');
                              setPasswordError(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                          Tell the member this password out-of-band (in person, WhatsApp, etc.) —
                          it isn&apos;t emailed to them. They can change it themselves from Profile afterward.
                        </p>
                      </div>
                    )}
                    {passwordError && <p className="field-error">{passwordError}</p>}
                    {passwordSuccess === selectedMember.id && !resettingPassword && (
                      <p style={{ fontSize: 12, color: '#22C55E', margin: '6px 0 0' }}>
                        Password updated. Let the member know their new password.
                      </p>
                    )}
                  </div>
                  
                )}
              </div>
                              {/* Grant/Revoke Admin Access — super_admin only, and never
                    shown for the caller's own row (server-side blocked too,
                    this is just UI-level avoidance of a doomed request). */}
                {callerRole === 'super_admin' && selectedMember.role === 'member' && (
                  <button
                    className="admin-btn-ghost"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => toggleAdminRole(selectedMember.id, true)}
                    disabled={roleSaving}
                  >
                    {roleSaving ? 'Saving...' : '★ Grant Admin Access'}
                  </button>
                )}
                {callerRole === 'super_admin' && selectedMember.role === 'admin' && (
                  <button
                    className="admin-btn-danger"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => toggleAdminRole(selectedMember.id, false)}
                    disabled={roleSaving}
                  >
                    {roleSaving ? 'Saving...' : '✕ Revoke Admin Access'}
                  </button>
                )}
                {roleError && <p className="field-error">{roleError}</p>}
            </div>
          )}
        </div>
        
      </div>
    </>
  );
}