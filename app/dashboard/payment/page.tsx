import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';
import { getCurrentUser } from '@/src/lib/get-current-user';
import { getPaymentSettings, getMyStudentCode, getYouTubeId } from '@/src/lib/payment-info';

export default async function TuitionPaymentPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/payment');
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    redirect('/auth/login?redirectTo=/dashboard/payment');
  }

  const [settings, studentCode] = await Promise.all([
    getPaymentSettings(),
    getMyStudentCode(authUser.id),
  ]);

  const backHref = user.program === 'fitness' ? '/dashboard/fitness' : '/dashboard';
  const videoId = getYouTubeId(settings.videoUrl);

  const codeBox = (label: string, value: string | null, emptyText: string) => (
    <div
      style={{
        flex: 1,
        minWidth: 220,
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px 24px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>
        {label}
      </p>
      {value ? (
        <p style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color: '#C9A84C', margin: 0, letterSpacing: '0.08em', wordBreak: 'break-all' }}>
          {value}
        </p>
      ) : (
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{emptyText}</p>
      )}
    </div>
  );

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
          style={{ display: 'inline-flex', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none', marginBottom: 28 }}
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
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '3px', color: '#C9A84C', textTransform: 'uppercase', margin: '0 0 10px' }}>
            EagleGlow
          </p>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: '#fff', margin: '0 0 28px' }}>
            Tuition Payment
          </h1>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            {codeBox('School Code', settings.schoolCode || null, 'Not yet available')}
            {codeBox('Your Student Code', studentCode, 'Not yet assigned — please contact the office')}
          </div>

          {settings.instructions && (
            <div style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap', marginBottom: videoId ? 28 : 0 }}>
              {settings.instructions}
            </div>
          )}

          {videoId && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="How to pay tuition"
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}