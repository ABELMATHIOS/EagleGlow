'use client';

export default function ClassesHero() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .classes-fade-up { animation: fadeUp 0.7s ease both; }
        .classes-hero-title { font-size: 60px; }
        @media (max-width: 768px) { .classes-hero-title { font-size: 44px !important; } }
        @media (max-width: 480px) { .classes-hero-title { font-size: 32px !important; } }
      `}</style>

      <section style={{
        position: 'relative', height: '440px', background: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)' }} />
        {[600, 420, 260].map((size) => (
          <div key={size} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size, height: size,
            border: '1px solid rgba(201,168,76,0.06)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.2), rgba(10,10,10,0.65))' }} />
        <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'linear-gradient(to bottom, transparent, #C9A84C, transparent)' }} />

        <div className="classes-fade-up" style={{ position: 'relative', textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            display: 'inline-block', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.25em', color: '#C9A84C', fontFamily: 'Arial, sans-serif',
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '4px', padding: '6px 16px', marginBottom: '24px',
          }}>
            WUSHU · FITNESS · WELLNESS
          </div>
          <h1 className="classes-hero-title" style={{
            fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05,
            margin: 0, fontFamily: 'Arial, sans-serif', color: '#fff',
          }}>
            CLASSES & <span style={{ color: '#C9A84C' }}>SCHEDULE</span>
          </h1>
          <p style={{ marginTop: '18px', fontSize: '16px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Arial, sans-serif' }}>
            Train with purpose. Grow with discipline.
          </p>
        </div>
      </section>
    </>
  );
}