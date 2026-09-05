import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getRules } from '@/src/lib/rules';

export default async function RulesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/rules');
  }

  // Rules apply to both programs — no program check needed here, unlike
  // the Belt-specific sections elsewhere.
  const rules = await getRules();
  const backHref = user.program === 'fitness' ? '/dashboard/fitness' : '/dashboard';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        fontFamily: "'Inter', sans-serif",
        color: '#e5e5e5',
        paddingTop: '80px',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Inter', sans-serif",
            color: 'rgba(255,255,255,0.45)',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 28,
          }}
        >
          ← Back to Dashboard
        </Link>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 24,
            padding: '40px',
          }}
        >
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: '3px',
            color: '#C9A84C',
            textTransform: 'uppercase',
            margin: '0 0 10px',
          }}>
            EagleGlow
          </p>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 28px',
          }}>
            {rules.title}
          </h1>

          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            lineHeight: 1.9,
            color: 'rgba(255,255,255,0.75)',
            whiteSpace: 'pre-wrap',
          }}>
            {rules.content}
          </div>
        </div>
      </div>
    </main>
  );
}