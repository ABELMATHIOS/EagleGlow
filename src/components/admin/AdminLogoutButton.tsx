'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/src/lib/auth';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        background: loading ? 'rgba(201,168,76,0.3)' : '#C9A84C',
        color: loading ? 'rgba(17,17,17,0.5)' : '#111',
        border: 'none',
        borderRadius: 8,
        padding: '9px 20px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease, transform 0.1s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.background = '#d9b85a';
      }}
      onMouseLeave={(e) => {
        if (!loading) e.currentTarget.style.background = '#C9A84C';
      }}
      onMouseDown={(e) => {
        if (!loading) e.currentTarget.style.transform = 'translateY(1px)';
      }}
      onMouseUp={(e) => {
        if (!loading) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {loading ? 'Signing out…' : 'Log out'}
    </button>
  );
}