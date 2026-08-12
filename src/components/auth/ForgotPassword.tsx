'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');

  const emailValid = EMAIL_RE.test(email);
  const canSubmit = emailValid && status !== 'submitting';

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    // Phase 6 — Supabase/NextAuth password-reset email goes here. Always
    // show the same "check your email" message regardless of whether the
    // address is registered — confirming or denying an account exists by
    // email is an account-enumeration risk best avoided even in a mock.
    setTimeout(() => {
      setStatus('sent');
    }, 800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-input {
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
        .login-input::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .login-input:focus {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
        }

        .login-btn {
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
        .login-btn:hover {
          background: #d9b85a;
          transform: translateY(-1px);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .login-btn:disabled {
          background: rgba(201,168,76,0.3);
          color: rgba(17,17,17,0.5);
          cursor: not-allowed;
          transform: none;
        }

        .register-link {
          color: #C9A84C;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .register-link:hover {
          opacity: 0.8;
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
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: 420,
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
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 28,
          }}>
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
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Cinzel, serif',
                fontWeight: 900, fontSize: 22,
                color: '#C9A84C',
              }}>E</div>
            )}
          </div>

          {status === 'sent' ? (
            <>
              {/* Success state */}
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(46,204,113,0.1)',
                  border: '1px solid rgba(46,204,113,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <path d="M2 9L8 15L20 2" stroke="#2ECC71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.04em', marginBottom: 10,
                }}>
                  CHECK YOUR EMAIL
                </h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '13px', lineHeight: 1.6,
                }}>
                  If an account exists for <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</strong>,
                  we&apos;ve sent a link to reset your password. It may take a few minutes to arrive.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Heading */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: '1.5rem', color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.06em', marginBottom: 8,
                }}>
                  RESET PASSWORD
                </h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '13px', lineHeight: 1.6,
                }}>
                  Enter the email on your account and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                    fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>Email</label>
                  <input
                    className="login-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {/* Submit button */}
                <div style={{ marginTop: 8 }}>
                  <button className="login-btn" onClick={handleSubmit} disabled={!canSubmit}>
                    {status === 'submitting' ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>

              </div>
            </>
          )}

          {/* Back to login */}
          <p style={{
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '13px',
            marginTop: 28,
          }}>
            <Link href="/auth/login" className="register-link">
              ← Back to sign in
            </Link>
          </p>

        </div>
      </main>
    </>
  );
}