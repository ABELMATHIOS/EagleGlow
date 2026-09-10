'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Discipline, Tutorial } from '@/src/types';

// Extracts a YouTube video ID from whatever canonical URL/id format is
// stored (watch?v=, youtu.be/, embed/, or a bare ID) so it can be embedded
// in an iframe here. Kept self-contained rather than depending on the
// admin-side youtube.ts internals, since this only needs to go one
// direction (URL -> embeddable ID), not parse/validate on input.
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

export default function SandaDisciplineTutorials({
  discipline,
  tutorials,
}: {
  discipline: Discipline;
  tutorials: Tutorial[];
}) {
  const [activeId, setActiveId] = useState<string | null>(tutorials[0]?.id ?? null);
  const active = tutorials.find((t) => t.id === activeId) ?? null;
  const activeVideoId = active?.videoUrl ? extractYoutubeId(active.videoUrl) : null;

  return (
    <>
            <style>{`
        .discipline-video-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .discipline-video-grid {
            grid-template-columns: 1fr;
          }
        }
        .video-list-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: #111111;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .video-list-item:hover {
          border-color: rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.04);
        }
        .video-list-item.active {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.08);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        padding: '100px 24px 60px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <Link
            href="/dashboard/sanda"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.45)',
              fontSize: 13, textDecoration: 'none', marginBottom: 24,
            }}
          >
            ← Back to Dashboard
          </Link>

          <h1 style={{
            fontFamily: 'Cinzel, serif', fontWeight: 700,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            color: '#fff', margin: '0 0 8px',
          }}>
            {discipline.name}
          </h1>
          {discipline.description && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px' }}>
              {discipline.description}
            </p>
          )}

          {tutorials.length === 0 ? (
            <div style={{
              background: '#111111', border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 16, padding: 32, textAlign: 'center', marginTop: 16,
            }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                No videos published for {discipline.name} yet — check back soon.
              </p>
            </div>
          ) : (
            <div className="discipline-video-grid">

              {/* Player / detail */}
              <div>
                {active && (
                  <div style={{
                    background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16, overflow: 'hidden',
                  }}>
                    {activeVideoId ? (
                      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${activeVideoId}`}
                          title={active.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        aspectRatio: '16/9', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: '#0d0d0d',
                      }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                          Taught in person — no video for this one.
                        </p>
                      </div>
                    )}
                    <div style={{ padding: 20 }}>
                      <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 16, color: '#fff', margin: '0 0 6px' }}>
                        {active.title}
                      </p>
                      {active.durationMinutes ? (
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
                          {formatDuration(active.durationMinutes)}
                        </p>
                      ) : null}
                      {active.description && (
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
                          {active.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Video list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tutorials.map((t) => (
                  <button
                    key={t.id}
                    className={`video-list-item${t.id === activeId ? ' active' : ''}`}
                    onClick={() => setActiveId(t.id)}
                  >
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                      {t.title}
                    </span>
                    {t.durationMinutes ? (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        {formatDuration(t.durationMinutes)}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}