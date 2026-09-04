'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, getCurrentSessionInfo } from '@/src/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const emailValid = EMAIL_RE.test(email);
  const emailShowError = email.length > 0 && !emailValid;
  const canSubmit = emailValid && password.length > 0 && status !== 'submitting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMessage('');

        try {
      await signIn(email, password);
      setStatus('idle');
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo) {
        router.push(redirectTo);
      } else {
                const { role, program } = await getCurrentSessionInfo();
        if (role === 'admin' || role === 'super_admin') {
          router.push('/admin');
        } else if (program === 'fitness') {
          router.push('/dashboard/fitness');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      );
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

        .field-error {
          font-family: Inter, sans-serif;
          font-size: 11.5px;
          color: #EF4444;
          margin: 0;
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
        .show-toggle:hover {
          color: #C9A84C;
        }

        .forgot-link {
          color: rgba(255,255,255,0.35);
          font-family: Inter, sans-serif;
          font-size: 12px;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .forgot-link:hover {
          color: #C9A84C;
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

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
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

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: '1.5rem', color: 'rgba(255,255,255,0.95)',
              letterSpacing: '0.06em', marginBottom: 8,
            }}>
              WELCOME BACK
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '13px',
            }}>
              Sign in to your EagleGlow account
            </p>
          </div>

          {/* Form — a real <form> so Enter submits it, not just clicking the button */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{
                fontFamily: 'Inter, sans-serif', fontSize: 11,
                fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>Email</label>
              <input
                className={`login-input${emailShowError ? ' invalid' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {emailShowError && (
                <p className="field-error">Enter a valid email address.</p>
              )}
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11,
                  fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>Password</label>
                <Link href="/auth/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 56 }}
                />
                <button
                  type="button"
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

           {/* Error message */}
            {status === 'error' && errorMessage && (
              <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>{errorMessage}</p>
            )}

            {/* Login button */}
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="login-btn" disabled={!canSubmit}>
                {status === 'submitting' ? 'Signing In…' : 'Sign In'}
              </button>
            </div>

          </form>

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
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>New to EagleGlow?</span>
            <div className="divider-line" />
          </div>

          {/* Register link */}
          <p style={{
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '13px',
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="register-link">
              Create one
            </Link>
          </p>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/" style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.2s ease',
            }}>
              ← Back to home
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}