'use client';

import { useState } from 'react';
import Link from 'next/link';

const BELT_DATA: Record<string, {
  name: string;
  color: string;
  tutorials: { id: number; title: string; duration: string; description: string; completed: boolean }[];
}> = {
  white: {
    name: 'White',
    color: '#FFFFFF',
    tutorials: [
      { id: 1, title: 'Introduction to Wushu',        duration: '12 min', description: 'Overview of Shaolin Wushu history and principles.',         completed: true  },
      { id: 2, title: 'Basic Stance & Footwork',      duration: '18 min', description: 'Learn the foundational stances used in all forms.',          completed: true  },
      { id: 3, title: 'Basic Hand Techniques',        duration: '20 min', description: 'Punches, palms, and basic strikes.',                          completed: true  },
      { id: 4, title: 'Basic Kick Techniques',        duration: '22 min', description: 'Front kick, side kick, and roundhouse fundamentals.',         completed: true  },
      { id: 5, title: 'Breathing & Meditation',       duration: '15 min', description: 'Wushu breathing methods for focus and endurance.',            completed: true  },
      { id: 6, title: 'White Belt Form (Taolu)',      duration: '30 min', description: 'Full white belt form combining all techniques learned.',      completed: true  },
    ],
  },
  yellow: {
    name: 'Yellow',
    color: '#FFD700',
    tutorials: [
      { id: 1, title: 'Intermediate Stances',         duration: '18 min', description: 'Horse stance, bow stance, and transitions.',                  completed: true  },
      { id: 2, title: 'Combination Strikes',          duration: '22 min', description: 'Linking hand techniques into fluid combinations.',            completed: true  },
      { id: 3, title: 'Jumping Kicks',                duration: '25 min', description: 'Introduction to jumping front and side kicks.',               completed: true  },
      { id: 4, title: 'Defensive Blocks',             duration: '20 min', description: 'Inside, outside, and downward blocking techniques.',          completed: true  },
      { id: 5, title: 'Partner Drills',               duration: '28 min', description: 'Basic partner work for distance and timing.',                 completed: true  },
      { id: 6, title: 'Yellow Belt Form (Taolu)',     duration: '35 min', description: 'Full yellow belt form combining all techniques.',             completed: true  },
    ],
  },
  green: {
    name: 'Green',
    color: '#2ECC71',
    tutorials: [
      { id: 1, title: 'Advanced Footwork',            duration: '20 min', description: 'Circular stepping and evasion patterns.',                     completed: true  },
      { id: 2, title: 'Spinning Techniques',          duration: '24 min', description: 'Spinning back kick and spinning heel kick.',                  completed: true  },
      { id: 3, title: 'Low Sweeps',                   duration: '22 min', description: 'Leg sweep fundamentals and entry setups.',                    completed: true  },
      { id: 4, title: 'Basic Sanda Sparring',         duration: '30 min', description: 'Introduction to Sanda combat principles.',                    completed: true  },
      { id: 5, title: 'Acrobatic Rolls',              duration: '26 min', description: 'Forward and backward rolls for safe falling.',                completed: false },
      { id: 6, title: 'Green Belt Form (Taolu)',      duration: '38 min', description: 'Full green belt form combining all techniques.',              completed: false },
    ],
  },
};

// Fallback for locked/unknown belts
const FALLBACK = { name: 'Unknown', color: '#C9A84C', tutorials: [] };

export default function TutorialDetail({ belt }: { belt: string }) {
  const data = BELT_DATA[belt] ?? FALLBACK;
  const [activeId, setActiveId] = useState<number | null>(null);

  const completed = data.tutorials.filter((t) => t.completed).length;
  const percent   = data.tutorials.length
    ? Math.round((completed / data.tutorials.length) * 100) : 0;

  return (
    <>
      <style>{`
        .tutorial-row {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tutorial-row:hover {
          border-color: rgba(201,168,76,0.2);
          background: rgba(201,168,76,0.03);
        }
        .tutorial-row.active {
          border-color: rgba(201,168,76,0.35);
          background: rgba(201,168,76,0.05);
        }
        .watch-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #C9A84C;
          color: #111;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-family: Inter, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.1s ease;
          flex-shrink: 0;
        }
        .watch-btn:hover {
          background: #d9b85a;
          transform: translateY(-1px);
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: Inter, sans-serif;
          color: rgba(255,255,255,0.3);
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s ease;
          margin-bottom: 40px;
        }
        .back-link:hover { color: #C9A84C; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        padding: '100px 24px 60px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Back */}
          <Link href="/tutorials" className="back-link">
            ← Back to Tutorials
          </Link>

          {/* Belt header */}
          <div style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: `3px solid ${data.color}`,
            borderRadius: 20,
            padding: '32px 36px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Belt visual */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `radial-gradient(circle, ${data.color}33, ${data.color}0a)`,
                border: `2px solid ${data.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${data.color}33`,
                flexShrink: 0,
              }}>
                <div style={{
                  width: 28, height: 6, borderRadius: 3,
                  background: data.color,
                }} />
              </div>

              <div>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11,
                  color: 'rgba(255,255,255,0.35)', fontWeight: 600,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  marginBottom: 4,
                }}>Belt Training</p>
                <h1 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                  color: 'rgba(255,255,255,0.95)',
                }}>
                  {data.name} Belt
                </h1>
              </div>
            </div>

            {/* Progress */}
            <div style={{ minWidth: 180 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                }}>{completed}/{data.tutorials.length} complete</span>
                <span style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  color: '#C9A84C', fontSize: 13,
                }}>{percent}%</span>
              </div>
              <div style={{
                width: '100%', height: 6,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 100, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${percent}%`, height: '100%',
                  background: `linear-gradient(90deg, ${data.color}, ${data.color}cc)`,
                  borderRadius: 100,
                }} />
              </div>
            </div>
          </div>

          {/* Tutorial list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.tutorials.map((t) => (
              <div
                key={t.id}
                className={`tutorial-row${activeId === t.id ? ' active' : ''}`}
                onClick={() => setActiveId(activeId === t.id ? null : t.id)}
              >
                {/* Number / check */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: t.completed
                    ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.04)',
                  border: t.completed
                    ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {t.completed ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontWeight: 700,
                      fontSize: 12, color: 'rgba(255,255,255,0.3)',
                    }}>{t.id}</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)', fontSize: 14,
                    marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{t.title}</p>

                  {activeId === t.id && (
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255,255,255,0.4)', fontSize: 13,
                      lineHeight: 1.6, marginTop: 4,
                    }}>{t.description}</p>
                  )}

                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255,255,255,0.25)', fontSize: 12,
                  }}>{t.duration}</span>
                </div>

                {/* Watch button */}
                <button className="watch-btn" onClick={(e) => e.stopPropagation()}>
                  {t.completed ? '↺ Rewatch' : '▶ Watch'}
                </button>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {data.tutorials.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700,
                fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)',
                marginBottom: 8,
              }}>Belt Locked</h2>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255,255,255,0.3)', fontSize: 13,
              }}>Complete your current belt to unlock this level.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}