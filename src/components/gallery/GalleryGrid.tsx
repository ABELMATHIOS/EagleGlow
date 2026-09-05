'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { GalleryAlbum } from '@/src/types';

const TABS = ['All', 'Graduation', 'Competition', 'Training'];

// ── Preview Image (with real fallback on load failure) ─────────
function PreviewImage({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        onClick={onClick}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1a1a1a, #111)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 28, opacity: 0.3 }}>📸</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      style={{ objectFit: 'cover' }}
      onError={() => setFailed(true)}
    />
  );
}

// ── YouTube Modal ─────────────────────────────────────────────
function YouTubeModal({
  videoId,
  title,
  onClose,
}: {
  videoId: string;
  title: string;
  onClose: () => void;
}) {
  const isPlaceholder = videoId.startsWith('PLACEHOLDER');
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 900 }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 14,
            fontWeight: 600, color: '#fff', margin: 0,
          }}>
            {title}
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none', color: '#fff',
              width: 36, height: 36, borderRadius: '50%',
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Video */}
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden' }}>
          {isPlaceholder ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#111', display: 'flex',
              flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24,
              }}>
                ▶
              </div>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.3)', margin: 0,
              }}>
                YouTube link coming soon
              </p>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', border: 'none',
              }}
            />
          )}
        </div>

        {/* Open on YouTube */}
        {!isPlaceholder && (
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12,
                color: '#C9A84C', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              Open on YouTube ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Photo Lightbox ────────────────────────────────────────────
function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 998,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.1)', border: 'none',
        color: '#fff', width: 40, height: 40, borderRadius: '50%',
        cursor: 'pointer', fontSize: 18, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {index > 0 && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          color: '#fff', width: 44, height: 44, borderRadius: '50%',
          cursor: 'pointer', fontSize: 24, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '88vw', height: '80vh', maxWidth: 1100 }}
      >
        <Image
          src={photos[index]}
          alt={`Photo ${index + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          onError={() => {}}
        />
        <p style={{
          position: 'absolute', bottom: -28, left: 0, right: 0,
          textAlign: 'center', color: 'rgba(255,255,255,0.3)',
          fontSize: 12, fontFamily: 'Inter, sans-serif',
        }}>
          {index + 1} / {photos.length}
        </p>
      </div>

      {index < photos.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          color: '#fff', width: 44, height: 44, borderRadius: '50%',
          cursor: 'pointer', fontSize: 24, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
      )}
    </div>
  );
}

// ── Album Card ────────────────────────────────────────────────
function AlbumCard({
  album,
  onPlayVideo,
  onOpenPhoto,
}: {
  album: GalleryAlbum;
  onPlayVideo: (id: string, title: string) => void;
  onOpenPhoto: (photos: string[], index: number) => void;
}) {
  const isPlaceholderAlbum = album.albumUrl === 'PLACEHOLDER_ALBUM_URL';

  return (
    <>
      <style>{`
        .album-card {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .album-card:hover { border-color: rgba(201,168,76,0.25); }

        .preview-grid-3 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 3px;
          aspect-ratio: 16/9;
        }
        .preview-main {
          grid-row: 1 / 3;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .preview-small {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .preview-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.3s;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .preview-main:hover .preview-overlay,
.preview-small:hover .preview-overlay {
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
        .video-only-thumb {
          aspect-ratio: 16/9;
          background: #0d0d0d;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12; cursor: pointer;
          position: relative; overflow: hidden;
        }
        .play-btn-large {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 2px solid rgba(201,168,76,0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; color: #C9A84C;
          transition: all 0.2s;
        }
        .video-only-thumb:hover .play-btn-large {
          background: rgba(201,168,76,0.25);
          transform: scale(1.08);
        }
        .album-footer {
          padding: 16px 18px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12;
          flex-wrap: wrap;
        }
        .album-action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          font-weight: 600; letter-spacing: 0.06em;
          padding: 7px 14px; border-radius: 8px;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          white-space: nowrap;
        }
        .btn-photos {
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          color: #C9A84C;
        }
        .btn-photos:hover {
          background: rgba(201,168,76,0.18);
          border-color: rgba(201,168,76,0.5);
        }
        .btn-video {
          background: rgba(231,76,60,0.1);
          border: 1px solid rgba(231,76,60,0.25);
          color: #E74C3C;
        }
        .btn-video:hover {
          background: rgba(231,76,60,0.18);
          border-color: rgba(231,76,60,0.5);
        }
      `}</style>

      <div className="album-card">

        {/* Preview area */}
        {album.videoOnly ? (
          /* Video only — no photos */
          <div
            className="video-only-thumb"
            onClick={() => album.youtubeId && onPlayVideo(album.youtubeId, `${album.title} — ${album.subtitle}`)}
          >
            {/* YouTube thumbnail as background */}
            {album.youtubeId && !album.youtubeId.startsWith('PLACEHOLDER') && (
              <Image
                src={`https://img.youtube.com/vi/${album.youtubeId}/hqdefault.jpg`}
                alt={album.title}
                fill
                style={{ objectFit: 'cover', opacity: 0.4 }}
                onError={() => {}}
              />
            )}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="play-btn-large">▶</div>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12,
                color: 'rgba(255,255,255,0.5)', margin: 0,
              }}>
                Click to watch ceremony
              </p>
            </div>
          </div>
        ) : album.previews.length > 0 ? (
          /* 3 preview photos grid — each slot falls back cleanly on load failure */
          <div className="preview-grid-3">
  <div className="preview-main" onClick={() => onOpenPhoto(album.previews, 0)}>
    <PreviewImage
      src={album.previews[0]}
      alt="Preview 1"
      onClick={() => onOpenPhoto(album.previews, 0)}
    />
    <div className="preview-overlay" />
  </div>
  {album.previews.slice(1, 3).map((src, i) => (
    <div key={i} className="preview-small" onClick={() => onOpenPhoto(album.previews, i + 1)}>
      <PreviewImage
        src={src}
        alt={`Preview ${i + 2}`}
        onClick={() => onOpenPhoto(album.previews, i + 1)}
      />
      <div className="preview-overlay" />
    </div>
  ))}
</div>
        ) : album.youtubeId ? (
          /* No uploaded photos, but has a video — use the YouTube thumbnail */
          <div
            className="video-only-thumb"
            onClick={() => onPlayVideo(album.youtubeId!, `${album.title} — ${album.subtitle}`)}
          >
            {!album.youtubeId.startsWith('PLACEHOLDER') && (
              <Image
                src={`https://img.youtube.com/vi/${album.youtubeId}/hqdefault.jpg`}
                alt={album.title}
                fill
                style={{ objectFit: 'cover', opacity: 0.4 }}
                onError={() => {}}
              />
            )}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="play-btn-large">▶</div>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12,
                color: 'rgba(255,255,255,0.5)', margin: 0,
              }}>
                Click to watch
              </p>
            </div>
          </div>
        ) : (
          /* No photos, no video — just a link-only album (e.g. Google Photos only) */
          <div style={{
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, #1a1a1a, #111)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36, opacity: 0.15 }}>📸</span>
          </div>
        )}

        {/* Footer */}
        <div className="album-footer">
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              fontWeight: 600, color: '#fff', margin: '0 0 2px 0',
            }}>
              {album.title}
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11,
              color: 'rgba(255,255,255,0.35)', margin: 0,
            }}>
              {album.subtitle}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* View album button */}
            {album.albumUrl && !album.videoOnly && (
              <a
                href={isPlaceholderAlbum ? '#' : album.albumUrl}
                target={isPlaceholderAlbum ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="album-action-btn btn-photos"
                onClick={isPlaceholderAlbum ? (e) => e.preventDefault() : undefined}
                title={isPlaceholderAlbum ? 'Album coming soon' : undefined}
              >
                📸 View Album
              </a>
            )}

            {/* Watch video button */}
            {album.youtubeId && (
              <button
                className="album-action-btn btn-video"
                onClick={() => onPlayVideo(
                  album.youtubeId!,
                  `${album.title} — ${album.subtitle}`
                )}
              >
                ▶ Watch Video
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────
type GalleryGridProps = {
  albums: GalleryAlbum[];
};

export default function GalleryGrid({ albums: ALBUMS }: GalleryGridProps) {
  const [activeTab,    setActiveTab]    = useState('All');
  const [videoModal,   setVideoModal]   = useState<{ id: string; title: string } | null>(null);
  const [lightbox,     setLightbox]     = useState<{ photos: string[]; index: number } | null>(null);

  const filtered = activeTab === 'All'
    ? ALBUMS
    : ALBUMS.filter((a) => a.category === activeTab.toLowerCase());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .tab-btn {
          padding: 8px 20px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .tab-btn:hover {
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.2);
        }
        .tab-btn-active {
          background: rgba(201,168,76,0.12) !important;
          border-color: rgba(201,168,76,0.4) !important;
          color: #C9A84C !important;
        }
        .albums-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .albums-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section style={{ background: '#0d0d0d', padding: '80px 0 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 56,
          }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Albums grid */}
          <div className="albums-grid">
            {filtered.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onPlayVideo={(id, title) => setVideoModal({ id, title })}
                onOpenPhoto={(photos, index) => setLightbox({ photos, index })}
              />
            ))}
          </div>

        </div>
      </section>

      {/* YouTube Modal */}
      {videoModal && (
        <YouTubeModal
          videoId={videoModal.id}
          title={videoModal.title}
          onClose={() => setVideoModal(null)}
        />
      )}

      {/* Photo Lightbox */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((l) => l && l.index > 0 ? { ...l, index: l.index - 1 } : l)}
          onNext={() => setLightbox((l) => l && l.index < l.photos.length - 1 ? { ...l, index: l.index + 1 } : l)}
        />
      )}
    </>
  );
}