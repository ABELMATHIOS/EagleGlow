'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';

export default function ResetPassword() {
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);

  // The Supabase email link redirects here with a recovery token in the
  // URL that the client SDK exchanges for a session automatically. Until
  // that finishes, there's no session yet to call updateUser() against.
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const supabase = createClient();
    // PASSWORD_RECOVERY fires once the SDK has parsed the recovery link
    // and established a session. Also check immediately in case it fired
    // before this listener was attached.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    const timeout = setTimeout(() => {
      setSessionReady((ready) => {
        if (!ready) setSessionError(true);
        return ready;
      });
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const newPasswordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = sessionReady && newPasswordValid && passwordsMatch && status !== 'submitting';

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatus('done');
      setTimeout(() => router.push('/dashboard'), 1800);
    } catch (err) {
      setStatus('idle');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    }
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
        .login-input.invalid {
          border-color: rgba(239,68,68,0.5);
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

          {sessionError ? (
            <>
              {/* Expired / invalid link state */}
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <h1 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.04em', marginBottom: 10,
                }}>
                  LINK EXPIRED
                </h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '13px', lineHeight: 1.6,
                }}>
                  This password reset link is invalid or has expired. Request a new one to continue.
                </p>
                <div style={{ marginTop: 24 }}>
                  <Link href="/auth/forgot-password" className="register-link">
                    Request a new link →
                  </Link>
                </div>
              </div>
            </>
          ) : status === 'done' ? (
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
                  PASSWORD UPDATED
                </h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '13px', lineHeight: 1.6,
                }}>
                  Taking you to your dashboard…
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
                  SET NEW PASSWORD
                </h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '13px', lineHeight: 1.6,
                }}>
                  Choose a new password for your account.
                </p>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                    fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>New Password</label>
                  <input
                    className={`login-input${newPassword && !newPasswordValid ? ' invalid' : ''}`}
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {newPassword && !newPasswordValid && (
                    <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>At least 8 characters.</p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                    fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>Confirm New Password</label>
                  <input
                    className={`login-input${confirmPassword && !passwordsMatch ? ' invalid' : ''}`}
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>Passwords don&apos;t match.</p>
                  )}
                </div>

                {errorMessage && (
                  <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>{errorMessage}</p>
                )}

                <div style={{ marginTop: 8 }}>
                  <button className="login-btn" onClick={handleSubmit} disabled={!canSubmit}>
                    {status === 'submitting' ? 'Updating…' : !sessionReady ? 'Verifying link…' : 'Update Password'}
                  </button>
                </div>

              </div>
            </>
          )}

          {status !== 'done' && !sessionError && (
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
          )}

        </div>
      </main>
    </>
  );
}