'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { AboutContent, Certificate } from '@/src/types';
import { updateAboutContent } from '@/src/lib/admin-action';
import { uploadAboutPhoto, deleteAboutPhotos } from '@/src/lib/about-upload';

type AdminAboutProps = {
  initialContent: AboutContent;
};

function newCertId() {
  return `c${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export default function AdminAbout({ initialContent }: AdminAboutProps) {
  const [content, setContent] = useState<AboutContent>(initialContent);
  const [saved, setSaved] = useState<AboutContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Real: photo upload — uploads to Supabase Storage immediately on file
  // select, per the same "upload on pick, not on save" pattern as Gallery.
  const [uploadingMaster, setUploadingMaster] = useState(false);
  const [masterUploadError, setMasterUploadError] = useState<string | null>(null);
  const masterFileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingCertId, setUploadingCertId] = useState<string | null>(null);
  const [certUploadError, setCertUploadError] = useState<string | null>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const pendingCertIdRef = useRef<string | null>(null);

  const isDirty = JSON.stringify(content) !== JSON.stringify(saved);

  const setField = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    setJustSaved(false);
    setContent((c) => ({ ...c, [key]: value }));
  };

  const addCertificate = () => {
    setField('certificates', [...content.certificates, { id: newCertId(), url: '', caption: '' }]);
  };

  const updateCertificate = (id: string, patch: Partial<Certificate>) => {
    setField('certificates', content.certificates.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCertificate = (id: string) => {
    const cert = content.certificates.find((c) => c.id === id);
    setField('certificates', content.certificates.filter((c) => c.id !== id));
    // Only removes it from the form's pending list — mirrors Gallery's
    // "harmless orphan unless cleaned up" behavior for save-then-abandon,
    // but since About has no separate save-per-item step, we do try to
    // clean up storage right away here.
    if (cert?.url) {
      deleteAboutPhotos([cert.url]).catch((err) => {
        console.error('Failed to clean up storage file for removed certificate:', err);
      });
    }
  };

  async function handleMasterPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMaster(true);
    setMasterUploadError(null);
    try {
      const oldUrl = content.masterPhotoUrl;
      const url = await uploadAboutPhoto(file, 'master');
      setField('masterPhotoUrl', url);
      if (oldUrl) {
        deleteAboutPhotos([oldUrl]).catch((err) => {
          console.error('Failed to clean up old master photo:', err);
        });
      }
    } catch (err) {
      setMasterUploadError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingMaster(false);
      if (masterFileInputRef.current) masterFileInputRef.current.value = '';
    }
  }

  function removeMasterPhoto() {
    const oldUrl = content.masterPhotoUrl;
    setField('masterPhotoUrl', null);
    if (oldUrl) {
      deleteAboutPhotos([oldUrl]).catch((err) => {
        console.error('Failed to clean up old master photo:', err);
      });
    }
  }

  function triggerCertUpload(certId: string) {
    pendingCertIdRef.current = certId;
    setCertUploadError(null);
    certFileInputRef.current?.click();
  }

  async function handleCertPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const certId = pendingCertIdRef.current;
    if (!file || !certId) return;
    setUploadingCertId(certId);
    setCertUploadError(null);
    try {
      const oldCert = content.certificates.find((c) => c.id === certId);
      const url = await uploadAboutPhoto(file, 'certificates');
      updateCertificate(certId, { url });
      if (oldCert?.url) {
        deleteAboutPhotos([oldCert.url]).catch((err) => {
          console.error('Failed to clean up old certificate photo:', err);
        });
      }
    } catch (err) {
      setCertUploadError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingCertId(null);
      pendingCertIdRef.current = null;
      if (certFileInputRef.current) certFileInputRef.current.value = '';
    }
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const {
        ourStory, ourVision, ourMission, ourGoal,
        masterName, masterTitle, masterBio,
        quoteText, quoteAuthor, masterPhotoUrl,
        certificates,
      } = content;
      const updated = await updateAboutContent({
        ourStory, ourVision, ourMission, ourGoal,
        masterName, masterTitle, masterBio,
        quoteText, quoteAuthor, masterPhotoUrl,
        certificates,
      });
      setSaved(updated);
      setContent(updated);
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setContent(saved);
    setError(null);
    setJustSaved(false);
  };

  return (
    <>
      <style>{`
        .about-admin-wrap { max-width: 760px; font-family: 'Inter', sans-serif; }
        .about-section {
          background: #111; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 22px; margin-bottom: 18px;
        }
        .about-label {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin: 0 0 8px;
        }
        .about-input, .about-textarea {
          background: #0b0b0b; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #fff;
          font-family: 'Inter', sans-serif; outline: none; width: 100%;
          box-sizing: border-box; transition: border-color 0.2s;
        }
        .about-input:focus, .about-textarea:focus { border-color: rgba(201,168,76,0.4); }
        .about-textarea { min-height: 90px; resize: vertical; }
        .about-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .about-btn-gold {
          background: #C9A84C; color: #111; border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 12px; font-weight: 700;
          font-family: 'Inter', sans-serif; cursor: pointer; letter-spacing: 0.04em;
        }
        .about-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }
        .about-btn-ghost {
          background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 10px 20px; font-size: 12px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
        }
        .about-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .about-btn-danger {
          background: transparent; color: #E74C3C; border: 1px solid rgba(231,76,60,0.3);
          border-radius: 8px; padding: 6px 10px; font-size: 11px; cursor: pointer;
        }
        .about-error { font-size: 12px; color: #E74C3C; margin: 8px 0 0; }
        .about-success { font-size: 12px; color: #2ECC71; margin: 8px 0 0; }
        .about-cert-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
        .about-upload-thumb {
          width: 64px; height: 64px; border-radius: 10px;
          overflow: hidden; position: relative;
          background: #1a1a1a; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .about-upload-thumb-remove {
          position: absolute; top: 2px; right: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(0,0,0,0.7); color: #fff;
          border: none; cursor: pointer;
          font-size: 11px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .about-upload-slot {
          width: 64px; height: 64px; border-radius: 10px;
          border: 1px dashed rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          color: rgba(255,255,255,0.3); font-size: 20px;
          transition: border-color 0.18s, color 0.18s;
        }
        .about-upload-slot:hover { border-color: rgba(201,168,76,0.4); color: #C9A84C; }
        .about-upload-slot.disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="about-admin-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>About Us</h1>
          {content.updatedAt && (
  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
    Last updated {new Date(content.updatedAt).toLocaleDateString('en-US')}
  </span>
)}
        </div>

        <div className="about-section">
          <p className="about-label">Our Story</p>
          <textarea
            className="about-textarea"
            value={content.ourStory}
            onChange={(e) => setField('ourStory', e.target.value)}
          />
        </div>

        <div className="about-section">
          <p className="about-label">Our Vision</p>
          <textarea
            className="about-textarea"
            value={content.ourVision}
            onChange={(e) => setField('ourVision', e.target.value)}
          />
        </div>

        <div className="about-section">
          <p className="about-label">Our Mission</p>
          <textarea
            className="about-textarea"
            value={content.ourMission}
            onChange={(e) => setField('ourMission', e.target.value)}
          />
        </div>

        <div className="about-section">
          <p className="about-label">Our Goal</p>
          <textarea
            className="about-textarea"
            value={content.ourGoal}
            onChange={(e) => setField('ourGoal', e.target.value)}
          />
        </div>

        <div className="about-section">
          <p className="about-label">Meet Our Master</p>
          <div className="about-row">
            <input
              className="about-input"
              placeholder="Name"
              value={content.masterName}
              onChange={(e) => setField('masterName', e.target.value)}
            />
            <input
              className="about-input"
              placeholder="Title (e.g. Founder & Head Instructor)"
              value={content.masterTitle}
              onChange={(e) => setField('masterTitle', e.target.value)}
            />
          </div>
          <textarea
            className="about-textarea"
            style={{ marginBottom: 10 }}
            placeholder="Bio (shown as the two intro paragraphs)"
            value={content.masterBio}
            onChange={(e) => setField('masterBio', e.target.value)}
          />
          <textarea
            className="about-textarea"
            style={{ marginBottom: 10, minHeight: 60 }}
            placeholder="Quote (e.g. a martial-arts quote featured alongside the bio)"
            value={content.quoteText}
            onChange={(e) => setField('quoteText', e.target.value)}
          />
          <input
            className="about-input"
            style={{ marginBottom: 14 }}
            placeholder="Quote Author (e.g. Bruce Lee, or Master Endale Melse)"
            value={content.quoteAuthor}
            onChange={(e) => setField('quoteAuthor', e.target.value)}
          />

          <p className="about-label">Master Photo</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {content.masterPhotoUrl ? (
              <div className="about-upload-thumb">
                <Image src={content.masterPhotoUrl} alt="" fill style={{ objectFit: 'cover' }} />
                <button
                  type="button"
                  className="about-upload-thumb-remove"
                  onClick={removeMasterPhoto}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={`about-upload-slot${uploadingMaster ? ' disabled' : ''}`}
                onClick={() => !uploadingMaster && masterFileInputRef.current?.click()}
                title="Add photo"
              >
                {uploadingMaster ? '…' : '+'}
              </div>
            )}
            <input
              ref={masterFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMasterPhotoSelect}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Uploads immediately to storage.
            </p>
          </div>
          {masterUploadError && <p className="about-error">{masterUploadError}</p>}
        </div>

        <div className="about-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p className="about-label" style={{ margin: 0 }}>Certificates & Recognition</p>
            <button className="about-btn-ghost" style={{ padding: '6px 12px' }} onClick={addCertificate}>
              + Add
            </button>
          </div>
          {content.certificates.length === 0 && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No certificates added yet.</p>
          )}
          {content.certificates.map((cert) => (
            <div className="about-cert-row" key={cert.id}>
              {cert.url ? (
                <div className="about-upload-thumb">
                  <Image src={cert.url} alt="" fill style={{ objectFit: 'cover' }} />
                  <button
                    type="button"
                    className="about-upload-thumb-remove"
                    onClick={() => updateCertificate(cert.id, { url: '' })}
                    title="Replace"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className={`about-upload-slot${uploadingCertId === cert.id ? ' disabled' : ''}`}
                  onClick={() => uploadingCertId !== cert.id && triggerCertUpload(cert.id)}
                  title="Add photo"
                >
                  {uploadingCertId === cert.id ? '…' : '+'}
                </div>
              )}
              <input
                className="about-input"
                placeholder="Caption"
                value={cert.caption}
                onChange={(e) => updateCertificate(cert.id, { caption: e.target.value })}
                style={{ flex: 1 }}
              />
              <button className="about-btn-danger" onClick={() => removeCertificate(cert.id)}>
                Remove
              </button>
            </div>
          ))}
          <input
            ref={certFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCertPhotoSelect}
            style={{ display: 'none' }}
          />
          {certUploadError && <p className="about-error">{certUploadError}</p>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="about-btn-gold" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {isDirty && (
            <button className="about-btn-ghost" onClick={handleDiscard} disabled={saving}>
              Discard
            </button>
          )}
        </div>
        {error && <p className="about-error">{error}</p>}
        {justSaved && !isDirty && <p className="about-success">Saved.</p>}
      </div>
    </>
  );
}