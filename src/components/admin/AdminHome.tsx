// src/components/admin/AdminHome.tsx
'use client';

import React, { useRef, useState } from 'react';
import { updateHomeContent } from '@/src/lib/admin-action';
import { uploadAboutPhoto, deleteAboutPhotos } from '@/src/lib/about-upload'; // reused — same bucket/helper, just folder: 'hero'

type HomeContent = { heroVideoUrl: string | null };

type AdminHomeProps = {
  initialContent: HomeContent;
};

export default function AdminHome({ initialContent }: AdminHomeProps) {
  const [content, setContent] = useState<HomeContent>(initialContent);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const oldUrl = content.heroVideoUrl;
      const url = await uploadAboutPhoto(file, 'hero');
      const updated = await updateHomeContent({ heroVideoUrl: url });
      setContent(updated);
      if (oldUrl) {
        deleteAboutPhotos([oldUrl]).catch((err) => {
          console.error('Failed to clean up old hero video:', err);
        });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function removeVideo() {
    const oldUrl = content.heroVideoUrl;
    try {
      const updated = await updateHomeContent({ heroVideoUrl: null });
      setContent(updated);
      if (oldUrl) {
        deleteAboutPhotos([oldUrl]).catch((err) => {
          console.error('Failed to clean up old hero video:', err);
        });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to remove video');
    }
  }

  return (
    <div style={{ maxWidth: 760, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Home Page</h1>

      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 12px' }}>
          Hero Background Video
        </p>

        {content.heroVideoUrl ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <video src={content.heroVideoUrl} muted style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 10 }} />
            <button
              type="button"
              onClick={removeVideo}
              style={{ background: 'transparent', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              width: 160, height: 90, borderRadius: 10,
              border: '1px dashed rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              color: 'rgba(255,255,255,0.3)', fontSize: 20,
            }}
          >
            {uploading ? '…' : '+'}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '10px 0 0' }}>
          Uploads immediately and saves. Replaces the Home page hero background video.
        </p>
        {uploadError && <p style={{ fontSize: 12, color: '#E74C3C', margin: '8px 0 0' }}>{uploadError}</p>}
      </div>
    </div>
  );
}