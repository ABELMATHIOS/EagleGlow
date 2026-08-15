'use client';

import type { AboutContent } from '@/src/types';

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      justifyContent: 'center', marginBottom: 18,
    }}>
      <span style={{ flex: 1, maxWidth: 60, height: 1, background: 'rgba(201,168,76,0.4)' }} />
      <span style={{
        color: '#C9A84C', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
      }}>{text}</span>
      <span style={{ flex: 1, maxWidth: 60, height: 1, background: 'rgba(201,168,76,0.4)' }} />
    </div>
  );
}

export default function OurVisionMissionGoal({ content }: { content: AboutContent }) {
  const cards = [
    { icon: '👁', label: 'Our Vision', text: content.ourVision },
    { icon: '🎯', label: 'Our Mission', text: content.ourMission },
    { icon: '🏆', label: 'Our Goal', text: content.ourGoal },
  ];

  return (
    <>
      <style>{`
        .vmg-card {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s ease;
        }
        .vmg-card:hover {
          background: rgba(201,168,76,0.06) !important;
          border-color: rgba(201,168,76,0.3) !important;
          transform: translateY(-4px);
        }
        .vmg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .vmg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section style={{ background: '#0a0a0a', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel text="Who We Are" />
            <h2 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)',
            }}>
              OUR <span style={{ color: '#C9A84C' }}>PURPOSE</span>
            </h2>
          </div>

          <div className="vmg-grid">
            {cards.map((card) => (
              <div key={card.label} className="vmg-card">
                <div style={{ width: 36, height: 3, background: '#C9A84C', borderRadius: 2 }} />
                <div style={{ fontSize: 32 }}>{card.icon}</div>
                <h3 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: '1.1rem', color: '#C9A84C', letterSpacing: '0.06em',
                }}>
                  {card.label.toUpperCase()}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.95rem', lineHeight: 1.75,
                }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}