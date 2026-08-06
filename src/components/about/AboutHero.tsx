'use client';

import Image from 'next/image';

export default function AboutHero() {
  return (
    <>
      <style>{`
        .about-hero-title { font-size: 4.5rem; }
        @media (max-width: 768px) { .about-hero-title { font-size: 3rem !important; } }
        @media (max-width: 480px) { .about-hero-title { font-size: 2.2rem !important; } }
      `}</style>

      <section style={{
        position: 'relative', minHeight: '60vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a', overflow: 'hidden', paddingTop: 80,
      }}>
        {/* Background image */}
        <Image
          src="/images/moment-1.jpg"
          alt="EagleGlow About Hero"
          fill
          style={{ objectFit: 'cover', opacity: 0.35 }}
          priority
          onError={() => {}}
        />

        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.80) 60%, #0a0a0a 100%)',
        }} />

        {/* Gold left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: '20%', width: 4,
          height: '60%',
          background: 'linear-gradient(180deg, transparent, #C9A84C, transparent)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', padding: '60px 24px',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 24, padding: '6px 18px', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
            <span style={{
              color: '#C9A84C', fontSize: 11, letterSpacing: '0.2em',
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
            }}>
              TRAIN WITH PURPOSE · SINCE 2002
            </span>
          </div>

          <h1 className="about-hero-title" style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900,
            lineHeight: 1.1, color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.04em',
          }}>
            ABOUT <span style={{ color: '#C9A84C' }}>US</span>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', marginTop: 20,
            color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Sight &nbsp;·&nbsp; Mind &nbsp;·&nbsp; Body
          </p>
        </div>
      </section>
    </>
  );
}