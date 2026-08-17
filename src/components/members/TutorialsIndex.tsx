'use client';

import Link from 'next/link';
import type { Tutorial, Belt } from '@/src/types';

type TutorialsIndexProps = {
  tutorials: Tutorial[]; // real Supabase published tutorials
  belts: Belt[]; // real Supabase belts, sorted by order ascending
  userBeltOrder: number; // the logged-in member's current belt's order (0 if none)
  completedTutorialIds: string[]; // real progress from tutorial_progress table
  onSelectBelt?: (slug: string) => void; // when provided (e.g. admin preview), intercepts card clicks instead of navigating via <Link>
};

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

export default function TutorialsIndex({ tutorials, belts, userBeltOrder, completedTutorialIds, onSelectBelt }: TutorialsIndexProps) {
  const completedSet = new Set(completedTutorialIds);

  // A member can see their current belt and everything below it — not belts
  // above their current level.
  const BELT_CARDS = belts.map((b) => {
    const beltTutorials = tutorials.filter((t) => t.beltId === b.id);
    return {
      name: b.name,
      slug: b.slug,
      color: b.color,
      textColor: b.textColor,
      tutorials: beltTutorials.length,
      completed: beltTutorials.filter((t) => completedSet.has(t.id)).length,
      unlocked: b.order <= userBeltOrder,
    };
  });

  return (
    <>
      <style>{`
        .belt-card-wrap {
          text-decoration: none;
          display: block;
        }
        .belt-card-inner {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 28px 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .belt-card-inner.unlocked:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.04);
          transform: translateY(-4px);
        }
        .belt-card-inner.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tutorials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .tutorials-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .tutorials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        padding: '100px 24px 60px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionLabel text="Belt Training" />
            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)', marginBottom: 16,
            }}>
              MY <span style={{ color: '#C9A84C' }}>TUTORIALS</span>
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem',
              maxWidth: 480, margin: '0 auto',
            }}>
              Complete tutorials for your current belt to unlock the next level.
            </p>
          </div>

          {/* Belt cards grid */}
          <div className="tutorials-grid">
            {BELT_CARDS.map((belt, i) => {
              const percent = belt.tutorials > 0
                ? Math.round((belt.completed / belt.tutorials) * 100) : 0;

              const cardContent = (
                <div className={`belt-card-inner ${belt.unlocked ? 'unlocked' : 'locked'}`}>

                  {/* Top color bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: belt.unlocked ? belt.color : 'rgba(255,255,255,0.08)',
                    borderRadius: '20px 20px 0 0',
                  }} />

                  {/* Belt level badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 20,
                  }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 10,
                      color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                    }}>Level {i + 1}</span>

                    {!belt.unlocked ? (
                      <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6, padding: '3px 10px',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <svg width="9" height="11" viewBox="0 0 10 12" fill="none">
                          <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                          <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                        </svg>
                        <span style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 10,
                          color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                        }}>Locked</span>
                      </div>
                    ) : percent === 100 ? (
                      <div style={{
                        background: 'rgba(46,204,113,0.1)',
                        border: '1px solid rgba(46,204,113,0.25)',
                        borderRadius: 6, padding: '3px 10px',
                      }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 10,
                          color: '#2ECC71', fontWeight: 700,
                        }}>✓ Complete</span>
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(201,168,76,0.1)',
                        border: '1px solid rgba(201,168,76,0.2)',
                        borderRadius: 6, padding: '3px 10px',
                      }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 10,
                          color: '#C9A84C', fontWeight: 700,
                        }}>In Progress</span>
                      </div>
                    )}
                  </div>

                  {/* Belt dot + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: belt.unlocked
                        ? `radial-gradient(circle, ${belt.color}33, ${belt.color}11)`
                        : 'rgba(255,255,255,0.05)',
                      border: belt.unlocked
                        ? `2px solid ${belt.color}66`
                        : '2px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: belt.unlocked ? `0 0 16px ${belt.color}33` : 'none',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: 22, height: 5, borderRadius: 3,
                        background: belt.unlocked ? belt.color : 'rgba(255,255,255,0.15)',
                      }} />
                    </div>

                    <div>
                      <h3 style={{
                        fontFamily: 'Cinzel, serif', fontWeight: 700,
                        fontSize: '1.1rem',
                        color: belt.unlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                        marginBottom: 2,
                      }}>{belt.name} Belt</h3>
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 12,
                        color: 'rgba(255,255,255,0.3)',
                      }}>{belt.tutorials} tutorials</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    width: '100%', height: 5,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 100, overflow: 'hidden', marginBottom: 8,
                  }}>
                    <div style={{
                      width: `${percent}%`, height: '100%',
                      background: belt.unlocked
                        ? `linear-gradient(90deg, ${belt.color}, ${belt.color}cc)`
                        : 'transparent',
                      borderRadius: 100,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11,
                      color: 'rgba(255,255,255,0.25)',
                    }}>
                      {belt.completed}/{belt.tutorials} complete
                    </span>
                    {belt.unlocked && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 11,
                        color: '#C9A84C', fontWeight: 700,
                      }}>{percent}%</span>
                    )}
                  </div>
                </div>
              );

              if (!belt.unlocked) {
                return (
                  <div key={belt.slug} className="belt-card-wrap">
                    {cardContent}
                  </div>
                );
              }

              // Admin preview (or any caller that wants to intercept navigation)
              // passes onSelectBelt — use a button so we stay inside the
              // preview overlay instead of doing a real route navigation.
              if (onSelectBelt) {
                return (
                  <button
                    key={belt.slug}
                    type="button"
                    className="belt-card-wrap"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      font: 'inherit',
                    }}
                    onClick={() => onSelectBelt(belt.slug)}
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <Link key={belt.slug} href={`/tutorials/${belt.slug}`} className="belt-card-wrap">
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}