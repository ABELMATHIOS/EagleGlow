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

// Stats row is intentionally hardcoded — out of CMS scope (see SESSION_LOG).
const stats = [
  { num: '2002', label: 'Founded' },
  { num: '23+',  label: 'Years Experience' },
  { num: '1,000+', label: 'Students Trained' },
  { num: '7',    label: 'Belt Levels' },
];

export default function OurStory({ content }: { content: AboutContent }) {
  const paragraphs = content.ourStory
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section style={{ background: '#0d0d0d', padding: '96px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel text="Our Story" />

        <h2 style={{
          fontFamily: 'Cinzel, serif', fontWeight: 700,
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          color: 'rgba(255,255,255,0.95)', marginBottom: 20,
        }}>
          TWO DECADES OF <span style={{ color: '#C9A84C' }}>EXCELLENCE</span>
        </h2>

        <p style={{
          fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem', maxWidth: 540, margin: '0 auto 48px',
        }}>
          From humble beginnings to a thriving community of martial artists in Addis Ababa.
        </p>

        {/* Story card */}
        <div style={{
          background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20, padding: '40px 48px', textAlign: 'left',
          borderLeft: '3px solid rgba(201,168,76,0.5)',
        }}>
          {paragraphs.map((para, i) => (
            <p key={i} style={{
              fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.65)',
              fontSize: '1rem', lineHeight: 1.85,
              marginBottom: i < paragraphs.length - 1 ? 20 : 0,
            }}>
              {para}
            </p>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: 48,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '24px 40px', textAlign: 'center',
              borderRight: i < stats.length - 1
                ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '2rem',
                fontWeight: 700, color: '#C9A84C',
              }}>{s.num}</div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginTop: 4,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}