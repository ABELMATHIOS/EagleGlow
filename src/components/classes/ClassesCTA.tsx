'use client';

export default function ClassesCTA() {
  return (
    <section style={{
      background: '#0a0a0a',
      borderTop: '1px solid rgba(201,168,76,0.12)',
      padding: '72px 24px', textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'Arial, sans-serif', margin: '0 0 12px' }}>
        Ready to Start <span style={{ color: '#C9A84C' }}>Training?</span>
      </h2>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Arial, sans-serif', marginBottom: '32px' }}>
        Your first class is just a step away. Come see us at Garji Jacros, Woreda 07, Addis Ababa.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <a href="/contact" style={{
          display: 'inline-block', padding: '14px 32px',
          background: '#C9A84C', color: '#111', fontFamily: 'Arial, sans-serif',
          fontWeight: 700, fontSize: '14px', letterSpacing: '0.08em',
          borderRadius: '8px', textDecoration: 'none',
        }}>
          CONTACT US
        </a>
        <a href="/auth/register" style={{
          display: 'inline-block', padding: '14px 32px',
          background: 'transparent', color: 'rgba(255,255,255,0.8)',
          fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
          letterSpacing: '0.08em', borderRadius: '8px', textDecoration: 'none',
          border: '1.5px solid rgba(255,255,255,0.25)',
        }}>
          REGISTER NOW
        </a>
      </div>
    </section>
  );
}