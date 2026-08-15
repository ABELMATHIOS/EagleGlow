"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { BELTS, getBeltById } from "@/src/data/belts";
import { createClient } from "@/src/lib/supabase/client";
import type { CurrentUserProfile } from "@/src/lib/get-profile";

type ProfileProps = {
  user: CurrentUserProfile;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/; // starts with + or a digit, at least 7 more digits/spaces/dashes

export default function ProfilePage({ user }: ProfileProps) {
  const router = useRouter();

  // Real member data, passed in from app/profile/page.tsx (a Server
  // Component that fetches it via getCurrentUserProfile()). Replaces the
  // old CURRENT_USER mock import — MEMBER keeps the same shape as before so
  // everything below this line works unchanged.
  const MEMBER = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    emergencyName: user.emergencyContactName,
    emergencyPhone: user.emergencyContactPhone,
    healthNotes: user.healthNotes,
    joinDate: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    beltOrder: getBeltById(user.beltId ?? "belt-1")!.order,
    avatar: user.photoUrl ?? null,
  };

  // ── Editable profile fields ──
  // "saved" = last committed values (what's shown when not editing).
  // "draft" = in-progress edits, only committed to "saved" on Save; discarded on Cancel.
  const [saved, setSaved] = useState({
    email: MEMBER.email,
    phone: MEMBER.phone,
    emergencyName: MEMBER.emergencyName,
    emergencyPhone: MEMBER.emergencyPhone,
    healthNotes: MEMBER.healthNotes,
    avatar: MEMBER.avatar,
  });
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [correctionSaving, setCorrectionSaving] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
 const currentBelt = BELTS.find((b) => b.order === MEMBER.beltOrder)!;
  const nextBelt = BELTS.find((b) => b.order === MEMBER.beltOrder + 1);

  const emailValid = EMAIL_RE.test(draft.email);
  const phoneValid = PHONE_RE.test(draft.phone);
  const emergencyPhoneValid = PHONE_RE.test(draft.emergencyPhone);
  const profileValid = emailValid && phoneValid && emergencyPhoneValid;

  const startEditing = () => {
    setDraft(saved);
    setProfileSaveSuccess(false);
    setSaveError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(saved);
    setSaveError(null);
    setEditing(false);
  };

  const saveEditing = async () => {
    if (!profileValid) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save profile");
      }
      setSaved(draft);
      setEditing(false);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2500);
      router.refresh(); // re-pulls the server-fetched user so the page reflects the DB
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    if (editing) fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDraft(d => ({ ...d, avatar: URL.createObjectURL(file) }));
  };

  // ── Password change (separate flow from profile editing) ──
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const newPasswordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passwordFormValid = currentPassword.length > 0 && newPasswordValid && passwordsMatch;

  const startChangingPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(false);
    setPasswordError(null);
    setChangingPassword(true);
  };

  const cancelChangingPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setChangingPassword(false);
  };

  const submitPasswordChange = async () => {
    if (!passwordFormValid) return;
    setPasswordSaving(true);
    setPasswordError(null);
    try {
      const supabase = createClient();

      // Supabase has no standalone "verify this password" call, so we
      // re-authenticate with the current password first — this confirms it's
      // correct and refreshes the session before the actual change.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: MEMBER.email,
        password: currentPassword,
      });
      if (reauthError) {
        throw new Error("Current password is incorrect.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        throw new Error(updateError.message);
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setChangingPassword(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Name correction request (separate from profile editing — Full Name stays
  // locked/admin-controlled, but a member can flag a mistake for review) ──
  const [requestingCorrection, setRequestingCorrection] = useState(false);
  const [correctedName, setCorrectedName] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);

  const correctionValid = correctedName.trim().length > 0 && correctedName.trim() !== MEMBER.name;

  const startCorrectionRequest = () => {
    setCorrectedName(MEMBER.name);
    setCorrectionNote("");
    setCorrectionSubmitted(false);
    setRequestingCorrection(true);
  };

  const cancelCorrectionRequest = () => {
    setRequestingCorrection(false);
  };

  const submitCorrectionRequest = async () => {
    if (!correctionValid) return;
    setCorrectionSaving(true);
    setCorrectionError(null);
    try {
      const res = await fetch("/api/profile/name-correction", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedName: correctedName.trim(), note: correctionNote.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to submit request");
      }
      setCorrectionSubmitted(true);
    } catch (err) {
      setCorrectionError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setCorrectionSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'Inter', sans-serif",
        color: "#e5e5e5",
        paddingTop: "80px",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

        .belt-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
        }
        .belt-scroll::-webkit-scrollbar { display: none; }
        .belt-scroll-wrap {
          position: relative;
        }
        .belt-scroll-wrap::before,
        .belt-scroll-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 24px;
          pointer-events: none;
          z-index: 2;
        }
        .belt-scroll-wrap::before {
          left: 0;
          background: linear-gradient(90deg, #0f0e0b 0%, transparent 100%);
        }
        .belt-scroll-wrap::after {
          right: 0;
          background: linear-gradient(270deg, #0f0e0b 0%, transparent 100%);
        }
        @media (min-width: 640px) {
          .belt-scroll { overflow-x: visible; }
          .belt-scroll-wrap::before,
          .belt-scroll-wrap::after { display: none; }
        }

        .belt-pip { transition: transform 0.2s, box-shadow 0.2s; }
        .belt-pip:hover { transform: scale(1.15); }

        .edit-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 8px;
          color: #e5e5e5;
          padding: 10px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .edit-input:focus { border-color: #C9A84C; }
        .edit-input.invalid { border-color: #EF4444; }

        .edit-textarea {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 8px;
          color: #e5e5e5;
          padding: 10px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          width: 100%;
          min-height: 72px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .edit-textarea:focus { border-color: #C9A84C; }

        .field-error {
          font-size: 11px;
          color: #EF4444;
          margin: 6px 0 0;
        }

        .field-hint {
          font-size: 11px;
          color: #555;
          margin: 6px 0 0;
        }

        .save-btn {
          background: linear-gradient(135deg, #C9A84C, #a8863c);
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .save-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .edit-btn {
          background: transparent;
          color: #C9A84C;
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 8px;
          padding: 8px 20px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .edit-btn:hover { background: rgba(201,168,76,0.1); }

        .text-link-btn {
          background: none;
          border: none;
          color: #C9A84C;
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .text-link-btn:hover { opacity: 0.8; }

        .success-banner {
          font-size: 13px;
          color: #22C55E;
          margin: 0 0 20px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px ${currentBelt.shadow}; }
          50%       { box-shadow: 0 0 40px ${currentBelt.shadow}, 0 0 60px ${currentBelt.shadow}; }
        }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ── HEADER CARD ── */}
        <div
          className="fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "24px",
            padding: "40px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative corner */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "200px", height: "200px",
            background: `radial-gradient(circle at top right, rgba(201,168,76,0.07), transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              onClick={handlePhotoClick}
              style={{
                width: "110px", height: "110px", borderRadius: "50%",
                background: (editing ? draft.avatar : saved.avatar)
                  ? `center/cover no-repeat url(${editing ? draft.avatar : saved.avatar})`
                  : "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
                border: `3px solid ${currentBelt.color}`,
                boxShadow: `0 0 24px ${currentBelt.shadow}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "glowPulse 3s ease-in-out infinite",
                fontSize: "42px",
                userSelect: "none",
                cursor: editing ? "pointer" : "default",
                overflow: "hidden",
              }}
            >
              {!(editing ? draft.avatar : saved.avatar) && "🥋"}
            </div>
            {editing && (
              <div
                onClick={handlePhotoClick}
                title="Change photo"
                style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: "20px",
                }}
              >
                📷
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            {/* Belt badge */}
            <div style={{
              position: "absolute", bottom: "-4px", right: "-4px",
              width: "32px", height: "32px", borderRadius: "50%",
              background: currentBelt.color,
              border: `2px solid #0a0a0a`,
              boxShadow: `0 0 10px ${currentBelt.shadow}`,
            }} />
          </div>

          {/* Name + info */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "11px",
              letterSpacing: "3px",
              color: "#C9A84C",
              textTransform: "uppercase",
              margin: "0 0 6px",
            }}>EagleGlow Member</p>
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 8px",
            }}>{MEMBER.name}</h1>
            <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#888" }}>
              📧 {saved.email}
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>
              📅 Member since {MEMBER.joinDate}
            </p>
          </div>

          {/* Edit button */}
          <div style={{ alignSelf: "flex-start" }}>
            <button className="edit-btn" onClick={() => (editing ? cancelEditing() : startEditing())}>
              {editing ? "CANCEL" : "EDIT PROFILE"}
            </button>
          </div>
        </div>

        {/* ── BELT PATHWAY ── */}
        <div
          className="fade-up delay-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "28px",
          }}
        >
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            color: "#C9A84C",
            textTransform: "uppercase",
            margin: "0 0 28px",
          }}>Belt Pathway</h2>

          <div style={{ position: "relative" }}>
            {/* Edge fades — hint that the row scrolls */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: "24px",
              background: "linear-gradient(90deg, rgba(10,10,10,1), transparent)",
              pointerEvents: "none", zIndex: 1,
            }} />
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: "24px",
              background: "linear-gradient(270deg, rgba(10,10,10,1), transparent)",
              pointerEvents: "none", zIndex: 1,
            }} />

            <div
              className="belt-scroll"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                overflowX: "auto", paddingBottom: "4px",
                scrollSnapType: "x proximity",
              }}
            >
              {BELTS.map((belt, i) => {
                const isAchieved = belt.order <= MEMBER.beltOrder;
                const isCurrent = belt.order === MEMBER.beltOrder;
                return (
                  <div key={belt.order} style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, scrollSnapAlign: "center" }}>
                    <div
                      className="belt-pip"
                      title={belt.name}
                      style={{
                        width: isCurrent ? "56px" : "40px",
                        height: isCurrent ? "56px" : "40px",
                        borderRadius: "50%",
                        background: isAchieved ? belt.color : "rgba(255,255,255,0.05)",
                        border: isCurrent
                          ? `3px solid #C9A84C`
                          : belt.order === 7
                          ? `2px solid ${belt.border || belt.color}`
                          : `2px solid ${isAchieved ? belt.color : "rgba(255,255,255,0.1)"}`,
                        boxShadow: isCurrent ? `0 0 20px ${belt.shadow}, 0 0 40px ${belt.shadow}` : isAchieved ? `0 0 8px ${belt.shadow}` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "default",
                        position: "relative",
                        transition: "all 0.3s",
                        flexShrink: 0,
                      }}
                    >
                      {isCurrent && (
                        <span style={{ fontSize: "18px" }}>🥋</span>
                      )}
                      {!isCurrent && isAchieved && (
                        <span style={{ fontSize: "14px", color: belt.order === 1 ? "#000" : "#000" }}>✓</span>
                      )}
                      {!isAchieved && (
                        <span style={{ fontSize: "12px", color: "#444" }}>{belt.order}</span>
                      )}
                    </div>
                    {i < BELTS.length - 1 && (
                      <div style={{
                        width: "24px", height: "2px", flexShrink: 0,
                        background: belt.order < MEMBER.beltOrder
                          ? "linear-gradient(90deg, #C9A84C, rgba(201,168,76,0.3))"
                          : "rgba(255,255,255,0.08)",
                        borderRadius: "2px",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", marginTop: "20px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: currentBelt.color, boxShadow: `0 0 8px ${currentBelt.shadow}` }} />
              <span style={{ fontSize: "13px", color: "#888" }}>Current: <span style={{ color: currentBelt.color, fontWeight: 600 }}>{currentBelt.name} Belt</span></span>
            </div>
            {nextBelt && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: `1px solid ${nextBelt.color}` }} />
                <span style={{ fontSize: "13px", color: "#888" }}>Next: <span style={{ color: "#aaa", fontWeight: 600 }}>{nextBelt.name} Belt</span></span>
              </div>
            )}
          </div>
        </div>

        {/* ── EDIT / INFO SECTION ── */}
        <div
          className="fade-up delay-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "28px",
          }}
        >
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            color: "#C9A84C",
            textTransform: "uppercase",
            margin: "0 0 24px",
          }}>Personal Information</h2>

          {profileSaveSuccess && (
            <p className="success-banner">✓ Profile updated.</p>
          )}
          {saveError && (
            <p className="field-error" style={{ marginBottom: "20px" }}>{saveError}</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {/* Full Name — read only, admin-controlled */}
            <div>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Full Name</label>
              <p style={{ margin: 0, fontSize: "15px", color: "#ccc", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{MEMBER.name}</p>
              {!requestingCorrection && !correctionSubmitted && (
                <p className="field-hint">
                  Contact the club to update your name, or{" "}
                  <button className="text-link-btn" onClick={startCorrectionRequest} type="button">
                    request a correction
                  </button>.
                </p>
              )}

              {requestingCorrection && !correctionSubmitted && (
                <div style={{ marginTop: "14px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Correct Name</label>
                  <input
                    className="edit-input"
                    value={correctedName}
                    onChange={e => setCorrectedName(e.target.value)}
                    type="text"
                  />
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", margin: "14px 0 8px" }}>
                    Note <span style={{ textTransform: "none" }}>(optional)</span>
                  </label>
                  <input
                    className="edit-input"
                    value={correctionNote}
                    onChange={e => setCorrectionNote(e.target.value)}
                    type="text"
                    placeholder="e.g. misspelled at registration"
                  />
                  <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                   <button className="save-btn" onClick={submitCorrectionRequest} disabled={!correctionValid || correctionSaving}>
                      {correctionSaving ? "SUBMITTING..." : "SUBMIT REQUEST"}
                    </button>
                    <button className="edit-btn" onClick={cancelCorrectionRequest} disabled={correctionSaving}>CANCEL</button>
                  </div>
                  {correctionError && <p className="field-error">{correctionError}</p>}
                </div>
              )}

              {correctionSubmitted && (
                <p className="success-banner" style={{ marginTop: "10px" }}>
                  ✓ Correction request submitted — an admin will review it.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Email</label>
              {editing ? (
                <>
                  <input
                    className={`edit-input${draft.email && !emailValid ? " invalid" : ""}`}
                    value={draft.email}
                    onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
                    type="email"
                  />
                  {draft.email && !emailValid && <p className="field-error">Enter a valid email address.</p>}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: "15px", color: "#ccc", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{saved.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Phone</label>
              {editing ? (
                <>
                  <input
                    className={`edit-input${draft.phone && !phoneValid ? " invalid" : ""}`}
                    value={draft.phone}
                    onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                    type="tel"
                  />
                  {draft.phone && !phoneValid && <p className="field-error">Enter a valid phone number.</p>}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: "15px", color: "#ccc", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{saved.phone}</p>
              )}
            </div>
          </div>

          {/* ── Emergency Contact — separated sub-section, matches Register's data ── */}
          <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "11px",
              letterSpacing: "2px",
              color: "#888",
              textTransform: "uppercase",
              margin: "0 0 20px",
            }}>Emergency Contact</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Contact Name</label>
                {editing ? (
                  <input
                    className="edit-input"
                    value={draft.emergencyName}
                    onChange={e => setDraft(d => ({ ...d, emergencyName: e.target.value }))}
                    type="text"
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: "15px", color: "#ccc", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{saved.emergencyName}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Contact Phone</label>
                {editing ? (
                  <>
                    <input
                      className={`edit-input${draft.emergencyPhone && !emergencyPhoneValid ? " invalid" : ""}`}
                      value={draft.emergencyPhone}
                      onChange={e => setDraft(d => ({ ...d, emergencyPhone: e.target.value }))}
                      type="tel"
                    />
                    {draft.emergencyPhone && !emergencyPhoneValid && <p className="field-error">Enter a valid phone number.</p>}
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: "15px", color: "#ccc", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{saved.emergencyPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Health / Medical Notes — same sensitive-field grouping as Register ── */}
          <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "11px",
              letterSpacing: "2px",
              color: "#888",
              textTransform: "uppercase",
              margin: "0 0 20px",
            }}>Health / Medical Notes</p>

            {editing ? (
              <>
                <textarea
                  className="edit-textarea"
                  value={draft.healthNotes}
                  onChange={e => setDraft(d => ({ ...d, healthNotes: e.target.value }))}
                  placeholder="Any conditions, injuries, or health information instructors should be aware of"
                  rows={3}
                />
                <p className="field-hint">Shared only with instructors — used to keep training safe for you.</p>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: "15px", color: saved.healthNotes ? "#ccc" : "#555", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {saved.healthNotes || "None on file."}
              </p>
            )}
          </div>

          {editing && (
            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <button className="save-btn" onClick={saveEditing} disabled={!profileValid || saving}>
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>
              <button className="edit-btn" onClick={cancelEditing} disabled={saving}>CANCEL</button>
            </div>
          )}
        </div>

        {/* ── PASSWORD ── */}
        <div
          className="fade-up delay-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: changingPassword ? "24px" : 0 }}>
            <div>
              <h2 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "14px",
                letterSpacing: "3px",
                color: "#C9A84C",
                textTransform: "uppercase",
                margin: "0 0 6px",
              }}>Password</h2>
              {!changingPassword && (
                <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>••••••••••••</p>
              )}
            </div>
            {!changingPassword && (
              <button className="edit-btn" onClick={startChangingPassword}>CHANGE PASSWORD</button>
            )}
          </div>

          {changingPassword && (
            <>
              {passwordSuccess ? (
                <p style={{ fontSize: "14px", color: "#22C55E", margin: 0 }}>✓ Password updated.</p>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Current Password</label>
                      <input
                        className="edit-input"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        type="password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>New Password</label>
                      <input
                        className={`edit-input${newPassword && !newPasswordValid ? " invalid" : ""}`}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                      />
                      {newPassword && !newPasswordValid && <p className="field-error">At least 8 characters.</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>Confirm New Password</label>
                      <input
                        className={`edit-input${confirmPassword && !passwordsMatch ? " invalid" : ""}`}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                      />
                      {confirmPassword && !passwordsMatch && <p className="field-error">Passwords don't match.</p>}
                    </div>
                  </div>
                  <div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <button className="save-btn" onClick={submitPasswordChange} disabled={!passwordFormValid || passwordSaving}>
                      {passwordSaving ? "UPDATING…" : "UPDATE PASSWORD"}
                    </button>
                    <button className="edit-btn" onClick={cancelChangingPassword} disabled={passwordSaving}>CANCEL</button>
                    {passwordError && <p className="field-error" style={{ margin: 0 }}>{passwordError}</p>}
                  </div>
                </>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  );
}