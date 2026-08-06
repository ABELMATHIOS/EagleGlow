'use client';

export default function GalleryHero() {
  return (
    <>
      <style>{`
        .gallery-hero-title { font-size: 4.5rem; }
        @media (max-width: 768px) { .gallery-hero-title { font-size: 3rem !important; } }
        @media (max-width: 480px) { .gallery-hero-title { font-size: 2.2rem !important; } }
      `}</style>

      <section style={{
        position: 'relative', minHeight: '50vh',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0a0a0a',
        overflow: 'hidden', paddingTop: 80,
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(201,168,76,0.04) 0%, transparent 50%)',
        }} />

        {/* Gold left accent */}
        <div style={{
          position: 'absolute', left: 0, top: '20%',
          width: 4, height: '60%',
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
              PHOTOS & VIDEOS
            </span>
          </div>

          <h1 className="gallery-hero-title" style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900,
            lineHeight: 1.1, color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.04em', margin: '0 0 20px 0',
          }}>
            OUR <span style={{ color: '#C9A84C' }}>GALLERY</span>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.4)', fontSize: '1rem',
            letterSpacing: '0.08em', margin: 0,
          }}>
            Moments from our journey — training, competitions & celebrations
          </p>
        </div>
      </section>
    </>
  );
}