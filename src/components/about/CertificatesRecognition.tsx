'use client';

import { useState } from 'react';
import Image from 'next/image';

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

// TODO: replace these placeholder names with the real certificate titles
const certificates = [
  { id: 1, name: '3rd Duan Wei Wushu Certification' },
  { id: 2, name: '3rd Duan Wei Taijiquan Certificate' },
  { id: 3, name: 'Addis Abeba Youth & Sport Bureau Certificate' },
  { id: 4, name: '5th Duan Wei Chanquan Certificate' },
  { id: 5, name: 'Black Belt Certificate' },
  { id: 6, name: 'Sifu of Nunchaku Certificate' },
  { id: 7, name: 'Ethiopian Wushu Federation Coaches Certificate' },
  { id: 8, name: 'International Wushu Innovation Training Certificate' },
];

export default function CertificatesRecognition() {
  const [openCert, setOpenCert] = useState<number | null>(null);
  const active = certificates.find((c) => c.id === openCert);

  return (
    <>
      <style>{`
        .cert-card {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 3/4;
          position: relative;
          cursor: pointer;
          transition: transform 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .cert-card:hover {
          transform: scale(1.04);
          border-color: rgba(201,168,76,0.5) !important;
        }
        .cert-image-wrap {
          flex: 1;
          position: relative;
          background: linear-gradient(135deg, #161616, #111);
        }
        .cert-caption {
          padding: 10px 12px;
          background: #0d0d0d;
          border-top: 1px solid rgba(255,255,255,0.05);
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cert-caption p {
          font-family: Inter, sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          margin: 0;
          line-height: 1.4;
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .cert-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .cert-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section style={{ background: '#0a0a0a', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel text="Achievements" />
            <h2 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'rgba(255,255,255,0.95)',
            }}>
              CERTIFICATES &{' '}
              <span style={{ color: '#C9A84C' }}>RECOGNITION</span>
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)',
              fontSize: '0.95rem', marginTop: 16, maxWidth: 480, margin: '16px auto 0',
            }}>
              Official certifications and awards recognizing EagleGlow&apos;s commitment to excellence.
            </p>
          </div>

          <div className="cert-grid">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="cert-card"
                onClick={() => setOpenCert(cert.id)}
              >
                <div className="cert-image-wrap">
                  <Image
                    src={`/images/certificate-${cert.id}.jpg`}
                    alt={cert.name}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="cert-caption">
                  <p>{cert.name}</p>
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* Lightbox */}
      {active && (
        <div
          onClick={() => setOpenCert(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 24, flexDirection: 'column', gap: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: '100%', maxWidth: 700, aspectRatio: '4/3' }}
          >
            <Image
              src={`/images/certificate-${active.id}.jpg`}
              alt={active.name}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)',
            fontSize: 14, textAlign: 'center',
          }}>
            {active.name}
          </p>
          <button
            onClick={() => setOpenCert(null)}
            style={{
              background: 'none', border: 'none', color: '#C9A84C',
              fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </>
  );
}