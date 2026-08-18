'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { signUp } from '@/src/lib/auth';



const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

type RegisterProps = {
  beltOptions: string[];
};

export default function Register({ beltOptions: BELT_OPTIONS }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    sex: '' as '' | 'male' | 'female',
    heightCm: '',
    weightKg: '',
    password: '',
    confirmPassword: '',
    registrationType: 'new' as 'new' | 'training' | 'returning',
    previousBelt: '',
    yearJoined: '',
    gapReason: '',
    emergencyName: '',
    emergencyPhone: '',
    healthNotes: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const passwordValid = form.password.length >= 8;
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const isReturningOrTraining = form.registrationType === 'training' || form.registrationType === 'returning';
  const yearJoinedValid = !isReturningOrTraining || form.yearJoined !== '';
  const previousBeltValid = !isReturningOrTraining || form.previousBelt !== '';

  // Required for everyone: everything except Health/Medical Notes (always
  // optional) and Gap Reason (optional, returning-only).
  const requiredFieldsFilled =
    form.fullName.trim() !== '' &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.dateOfBirth !== '' &&
    form.sex !== '' &&
    form.heightCm !== '' &&
    form.weightKg !== '' &&
    form.emergencyName.trim() !== '' &&
    form.emergencyPhone.trim() !== '';

  const canSubmit =
    agreed &&
    passwordValid &&
    passwordsMatch &&
    yearJoinedValid &&
    previousBeltValid &&
    requiredFieldsFilled &&
    submitStatus !== 'submitting';

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitStatus('submitting');
    setSubmitError('');

    // healthNotes is sensitive information — it's stored in public.users
    // with RLS scoped to the user's own row + admin/instructor server
    // routes only, never exposed in general member lists.
    try {
      if (!form.sex) throw new Error('Please select your sex.');
      await signUp({
        email: form.email,
        password: form.password,
        name: form.fullName,
        phone: form.phone,
        sex: form.sex,
        dateOfBirth: form.dateOfBirth,
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        emergencyContactName: form.emergencyName,
        emergencyContactPhone: form.emergencyPhone,
        healthNotes: form.healthNotes,
        registrationType: form.registrationType,
        previousBelt: form.previousBelt,
        // New members aren't asked this on the form (the field only shows
        // for training/returning) — default it to today's year so every
        // member row has a real join year, not an empty one.
        yearJoined: form.registrationType === 'new' ? String(CURRENT_YEAR) : form.yearJoined,
        gapReason: form.gapReason,
      });
      setSubmitStatus('idle');
      setSubmitted(true);
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 13px 14px;
          color: #fff;
          font-family: Inter, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .reg-input::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .reg-input:focus {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
        }

        .reg-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 13px 14px;
          color: #fff;
          font-family: Inter, sans-serif;
          font-size: 14px;
          outline: none;
          resize: vertical;
          min-height: 72px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .reg-textarea::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .reg-textarea:focus {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
        }

        .reg-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 13px 14px;
          color: #fff;
          font-family: Inter, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .reg-select:focus {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
        }
        .reg-select option {
          background: #111111;
          color: #fff;
        }

        .reg-btn {
          width: 100%;
          background: #C9A84C;
          color: #111;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-family: Inter, sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .reg-btn:hover {
          background: #d9b85a;
          transform: translateY(-1px);
        }
        .reg-btn:active {
          transform: translateY(0);
        }
        .reg-btn:disabled {
          background: rgba(201,168,76,0.3);
          color: rgba(17,17,17,0.5);
          cursor: not-allowed;
          transform: none;
        }

        .show-toggle {
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          font-family: Inter, sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0;
          transition: color 0.2s ease;
        }
        .show-toggle:hover { color: #C9A84C; }

        .login-link {
          color: #C9A84C;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .login-link:hover { opacity: 0.8; }

        .checkbox-box {
          width: 18px; height: 18px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .checkbox-box.checked {
          border-color: #C9A84C;
          background: rgba(201,168,76,0.15);
        }

        .success-card {
          text-align: center;
          padding: 16px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .reg-type-btn {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 8px;
          color: rgba(255,255,255,0.55);
          font-family: Inter, sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .reg-type-btn.active {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.1);
          color: #C9A84C;
        }
        .reg-type-btn:hover { border-color: rgba(201,168,76,0.3); }

        .section-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0 2px;
        }

        .field-note {
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          margin-top: 2px;
          line-height: 1.5;
        }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: 440,
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: '44px 40px',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* Gold top accent */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 80, height: 2,
            background: '#C9A84C',
            borderRadius: '0 0 4px 4px',
          }} />

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            {!logoError ? (
              <Image
                src="/images/Eagle-Logo.png"
                alt="EagleGlow Logo"
                width={64}
                height={64}
                style={{ objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontWeight: 900,
                fontSize: 22, color: '#C9A84C',
              }}>E</div>
            )}
          </div>

          {/* ── SUCCESS STATE ── */}
          {submitted ? (
            <div className="success-card">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28,
              }}>✓</div>

              <h2 style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700,
                fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)',
                letterSpacing: '0.04em', marginBottom: 12,
              }}>
                Account Pending Approval
              </h2>

              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255,255,255,0.45)',
                fontSize: 13, lineHeight: 1.8, marginBottom: 28,
              }}>
                Your registration has been submitted. Master Endale will review
                and approve your account shortly. You will be notified once approved.
              </p>

              <div style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 12, padding: '16px 20px', marginBottom: 28,
              }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 12, lineHeight: 1.7,
                }}>
                  Questions? Contact us at{' '}
                  <span style={{ color: '#C9A84C' }}>info.eagleglow@gmail.com</span>
                  {' '}or call{' '}
                  <span style={{ color: '#C9A84C' }}>+251-912-052-349</span>
                </p>
              </div>

              <Link href="/auth/login" style={{
                display: 'block', width: '100%',
                background: '#C9A84C', color: '#111',
                borderRadius: 10, padding: '13px',
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', textDecoration: 'none',
                textAlign: 'center',
              }}>
                Back to Login
              </Link>
            </div>

          ) : (

            /* ── FORM STATE ── */
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: '1.5rem', color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.06em', marginBottom: 8,
                }}>
                  CREATE ACCOUNT
                </h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 13,
                }}>
                  Join the EagleGlow community
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Registration type selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Which best describes you?</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      className={`reg-type-btn${form.registrationType === 'new' ? ' active' : ''}`}
                      onClick={() => handleChange('registrationType', 'new')}
                    >
                      New to EagleGlow
                    </div>
                    <div
                      className={`reg-type-btn${form.registrationType === 'training' ? ' active' : ''}`}
                      onClick={() => handleChange('registrationType', 'training')}
                    >
                      Currently Training
                    </div>
                    <div
                      className={`reg-type-btn${form.registrationType === 'returning' ? ' active' : ''}`}
                      onClick={() => handleChange('registrationType', 'returning')}
                    >
                      Returning
                    </div>
                  </div>
                </div>

                {/* Previous belt + Year joined — only for training / returning */}
                {(form.registrationType === 'training' || form.registrationType === 'returning') && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                        color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}>Current / Previous Belt <span style={{ color: '#E74C3C' }}>*</span></label>
                      <select
                        className="reg-select"
                        value={form.previousBelt}
                        onChange={(e) => handleChange('previousBelt', e.target.value)}
                        required
                      >
                        <option value="">Select a belt</option>
                        {BELT_OPTIONS.map((belt) => (
                          <option key={belt} value={belt}>{belt}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                        color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}>Year You Joined EagleGlow <span style={{ color: '#E74C3C' }}>*</span></label>
                      <select
                        className="reg-select"
                        value={form.yearJoined}
                        onChange={(e) => handleChange('yearJoined', e.target.value)}
                        required
                      >
                        <option value="">Select a year</option>
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Gap reason — only for returning, optional */}
                {form.registrationType === 'returning' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      Reason for the gap <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                    </label>
                    <input
                      className="reg-input"
                      type="text"
                      placeholder="e.g. school, work, injury"
                      value={form.gapReason}
                      onChange={(e) => handleChange('gapReason', e.target.value)}
                    />
                  </div>
                )}

                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Full Name <span style={{ color: '#E74C3C' }}>*</span></label>
                  <input
                    className="reg-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Email <span style={{ color: '#E74C3C' }}>*</span></label>
                  <input
                    className="reg-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>
                    Phone <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <input
                    className="reg-input"
                    type="tel"
                    placeholder="+251 900 000 000"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>
                    Date of Birth <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <input
                    className="reg-input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>

                {/* Sex */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>
                    Sex <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <select
                    className="reg-input"
                    value={form.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Height & Weight */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                    <label style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      Height (cm) <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
                    <input
                      className="reg-input"
                      type="number"
                      min={0}
                      placeholder="170"
                      value={form.heightCm}
                      onChange={(e) => handleChange('heightCm', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                    <label style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      Weight (kg) <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
                    <input
                      className="reg-input"
                      type="number"
                      min={0}
                      placeholder="65"
                      value={form.weightKg}
                      onChange={(e) => handleChange('weightKg', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="section-divider" />

                {/* Emergency Contact Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Emergency Contact Name <span style={{ color: '#E74C3C' }}>*</span></label>
                  <input
                    className="reg-input"
                    type="text"
                    placeholder="Full name"
                    value={form.emergencyName}
                    onChange={(e) => handleChange('emergencyName', e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Emergency Contact Phone <span style={{ color: '#E74C3C' }}>*</span></label>
                  <input
                    className="reg-input"
                    type="tel"
                    placeholder="+251 900 000 000"
                    value={form.emergencyPhone}
                    onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* Health / medical notes (optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>
                    Health / Medical Notes <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                  </label>
                  <textarea
                    className="reg-textarea"
                    placeholder="Any conditions, injuries, or health information instructors should be aware of"
                    value={form.healthNotes}
                    onChange={(e) => handleChange('healthNotes', e.target.value)}
                    rows={3}
                  />
                  <p className="field-note">
                    Shared only with instructors — used to keep training safe for you.
                  </p>
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="reg-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      autoComplete="new-password"
                      style={{ paddingRight: 56 }}
                    />
                    <button
                      className="show-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 14,
                        top: '50%', transform: 'translateY(-50%)',
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="reg-input"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      style={{ paddingRight: 56 }}
                    />
                    <button
                      className="show-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: 14,
                        top: '50%', transform: 'translateY(-50%)',
                      }}
                    >
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {form.password.length > 0 && !passwordValid && (
                    <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>
                      Password must be at least 8 characters.
                    </p>
                  )}
                  {form.confirmPassword.length > 0 && !passwordsMatch && (
                    <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Registration error */}
                {submitStatus === 'error' && submitError && (
                  <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>{submitError}</p>
                )}

                {/* Terms checkbox */}
                <div
                  style={{
                    display: 'flex', alignItems: 'flex-start',
                    gap: 12, cursor: 'pointer', marginTop: 4,
                  }}
                  onClick={() => setAgreed(!agreed)}
                >
                  <div className={`checkbox-box${agreed ? ' checked' : ''}`}>
                    {agreed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 12, lineHeight: 1.6,
                  }}>
                    I agree to the{' '}
                    <span style={{ color: '#C9A84C', cursor: 'pointer' }}>
                      Terms & Conditions
                    </span>
                    {' '}and{' '}
                    <span style={{ color: '#C9A84C', cursor: 'pointer' }}>
                      Privacy Policy
                    </span>
                  </p>
                </div>

                {/* Register button */}
                <div style={{ marginTop: 8 }}>
                  <button
                    className="reg-btn"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {submitStatus === 'submitting' ? 'Creating Account…' : 'Create Account'}
                  </button>
                </div>

              </div>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '28px 0',
              }}>
                <div className="divider-line" />
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>Already a member?</span>
                <div className="divider-line" />
              </div>

              {/* Login link */}
              <p style={{
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255,255,255,0.35)',
                fontSize: 13,
              }}>
                Already have an account?{' '}
                <Link href="/auth/login" className="login-link">
                  Sign in
                </Link>
              </p>

              {/* Back to home */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link href="/" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 12, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'color 0.2s ease',
                }}>
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}