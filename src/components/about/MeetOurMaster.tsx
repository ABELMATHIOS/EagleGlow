'use client';

import Image from 'next/image';
import { useState } from 'react';

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

export default function MeetOurMaster() {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <style>{`
        .master-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .master-photo-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .master-photo {
          width: 85%;
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 16px;
          overflow: hidden;
          background: #1a1a1a;
          border: 0.5px solid rgba(255,255,255,0.08);
          z-index: 1;
        }

        .master-deco-border {
          position: absolute;
          top: 20px;
          right: -12px;
          width: 85%;
          height: 90%;
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 16px;
          z-index: 0;
        }

        .master-since-badge {
          position: absolute;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          background: #C9A84C;
          color: #111;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 8px 18px;
          border-radius: 100px;
          box-shadow: 0 4px 20px rgba(201,168,76,0.4);
          white-space: nowrap;
          z-index: 2;
        }

        @media (max-width: 768px) {
          .master-grid {
            display: flex;
            flex-direction: column;
            gap: 48px;
          }
          .master-photo-wrapper {
            width: 100%;
          }
          .master-photo {
            width: 80%;
          }
          .master-deco-border {
            display: none;
          }
        }
      `}</style>

      <section style={{ background: '#0d0d0d', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel text="Leadership" />
            <h2 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)',
            }}>
              MEET OUR <span style={{ color: '#C9A84C' }}>MASTER</span>
            </h2>
          </div>

          <div className="master-grid">

            {/* ── Left — Text ── */}
            <div>
              <span style={{
                fontFamily: 'Inter, sans-serif', color: '#C9A84C',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}>
                Founder & Head Instructor
              </span>

              <h3 style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900,
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                color: 'rgba(255,255,255,0.95)',
                margin: '8px 0 12px', lineHeight: 1.2,
              }}>
                Master Endale Melse
              </h3>

              <div style={{
                width: 50, height: 3, background: '#C9A84C',
                borderRadius: 2, marginBottom: 24,
              }} />

              <p style={{
                fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.6)',
                fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 16,
              }}>
                Master Endale Melse has dedicated over two decades to teaching Shaolin Wushu in
                Ethiopia. A martial artist of exceptional discipline and vision, he founded EagleGlow
                in 2002 with a mission to make authentic martial arts accessible to all.
              </p>

              <p style={{
                fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.6)',
                fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 36,
              }}>
                From children to adults, beginners to advanced practitioners — Master Endale has
                shaped over 1,000 students with not just martial arts skills, but with confidence,
                discipline, and a lifelong respect for the art.
              </p>

              {/* Bruce Lee Quote */}
              <div style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderLeft: '3px solid #C9A84C',
                borderRadius: 12, padding: '24px 28px', position: 'relative',
              }}>
                <div style={{
                  fontFamily: 'Cinzel, serif', fontSize: 48,
                  color: 'rgba(201,168,76,0.2)', lineHeight: 1,
                  position: 'absolute', top: 8, left: 16,
                }}>&ldquo;</div>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem',
                  lineHeight: 1.8, paddingTop: 16,
                }}>
                  I Fear Not The Man Who Has Practiced 10,000 Kicks Once,
                  But I Fear The Man Who Has Practiced One Kick 10,000 Times.
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', color: '#C9A84C',
                  fontSize: '0.8rem', fontWeight: 600,
                  marginTop: 12, letterSpacing: '0.1em',
                }}>
                  — Bruce Lee
                </p>
              </div>
            </div>

            {/* ── Right — Photo ── */}
            <div className="master-photo-wrapper">

              {/* Decorative gold border */}
              <div className="master-deco-border" />

              {/* Photo */}
              <div className="master-photo">
                {imgError ? (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#161616', gap: 12,
                  }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 28,
                    }}>🥋</div>
                    <p style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.25)',
                      margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>Photo coming soon</p>
                  </div>
                ) : (
                  <Image
                    src="/images/master.jpg"
                    alt="Master Endale Melse"
                    fill
                    style={{ objectFit: 'cover' }}
                    onError={() => setImgError(true)}
                  />
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '40%',
                  background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))',
                  zIndex: 2,
                }} />

                {/* Name tag */}
                <div style={{
                  position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 3,
                }}>
                  <p style={{
                    fontSize: 15, fontWeight: 700,
                    color: '#fff', margin: '0 0 3px 0',
                    fontFamily: 'Cinzel, serif',
                  }}>
                    Master Endale Melse
                  </p>
                  <p style={{
                    fontSize: 11, color: '#C9A84C',
                    letterSpacing: '0.1em', margin: 0,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Founder & Head Master
                  </p>
                </div>
              </div>

              {/* Since badge */}
              <div className="master-since-badge">Since 2002</div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}