'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/src/lib/auth';
import type { User } from '@/src/types';

type PendingProps = {
  status: User['status'];
};

const CONTENT: Record<string, { icon: string; title: string; body: string }> = {
  pending: {
    icon: '⏳',
    title: 'Account Pending Approval',
    body: "Your account is still awaiting approval from Master Endale. You'll be able to access your dashboard once it's approved.",
  },
  paused: {
    icon: '⛔',
    title: 'Account Suspended',
    body: 'Your account has been suspended. Please contact the admin to find out why and get your account reactivated.',
  },
  withdrawn: {
    icon: '✕',
    title: 'Registration Declined',
    body: 'Your registration was not approved. Please contact the admin if you believe this was a mistake.',
  },
  served: {
    icon: '🎖',
    title: 'Service Term Ended',
    body: 'Your time as an assistant instructor has come to an end — thank you for your service. Contact the admin if you have questions or would like to continue training.',
  },
};

export default function Pending({ status }: PendingProps) {
  const [logoError, setLogoError] = useState(false);
  const { icon, title, body } = CONTENT[status] ?? CONTENT.pending;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        <div style={{
          position: 'absolute',
          top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%',
          maxWidth: 440,
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: '44px 40px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 80, height: 2,
            background: '#C9A84C',
            borderRadius: '0 0 4px 4px',
          }} />

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
<div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 28,
          }}>{icon}</div>

          <h1 style={{
            fontFamily: 'Cinzel, serif', fontWeight: 700,
            fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.04em', marginBottom: 12,
          }}>
            {title}
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.45)',
            fontSize: 13, lineHeight: 1.8, marginBottom: 28,
          }}>
            {body}
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
              <span style={{ color: '#C9A84C' }}>Eagleglow@gmail.com</span>
              {' '}or call{' '}
              <span style={{ color: '#C9A84C' }}>+251-912-052-349</span>
            </p>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              display: 'block', width: '100%',
              background: '#C9A84C', color: '#111', border: 'none',
              borderRadius: 10, padding: '13px',
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Sign Out
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/" style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.2)',
              fontSize: 12, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}