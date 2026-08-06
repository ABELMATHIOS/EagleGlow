"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const photos = [
  { src: "/images/moment-1.jpg", alt: "EagleGlow training moment 1" },
  { src: "/images/moment-2.jpg", alt: "EagleGlow training moment 2" },
  { src: "/images/moment-3.jpg", alt: "EagleGlow training moment 3" },
  { src: "/images/moment-4.jpg", alt: "EagleGlow training moment 4" },
  { src: "/images/moment-5.jpg", alt: "EagleGlow training moment 4" },
];

export default function OurMoments() {
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  return (
    <section style={{
      background: "#0a0a0a",
      padding: "100px 0",
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 24px",
      }}>

        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: 56,
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: "#C9A84C",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>
              Gallery
            </span>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "#fff",
            margin: "0 0 12px 0",
          }}>
            OUR <span style={{ color: "#C9A84C" }}>MOMENTS</span>
          </h2>
          <p style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.05em",
            margin: 0,
          }}>
            Discover our journey through pictures
          </p>
        </div>

        {/* Photo Grid */}
        <div className="moments-grid">

          {/* Large photo — left */}
          <div className="moments-large" style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            background: "#1a1a1a",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }}>
            {errors[0] ? (
              <PlaceholderImage />
            ) : (
              <Image
                src={photos[0].src}
                alt={photos[0].alt}
                fill
                style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                className="moments-img"
                onError={() => setErrors(p => ({ ...p, 0: true }))}
              />
            )}
            <div className="moments-overlay" />
          </div>

          {/* Right column — 3 smaller photos */}
          <div className="moments-right">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#1a1a1a",
                  border: "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                {errors[i] ? (
                  <PlaceholderImage />
                ) : (
                  <Image
                    src={photos[i].src}
                    alt={photos[i].alt}
                    fill
                    style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                    className="moments-img"
                    onError={() => setErrors(p => ({ ...p, [i]: true }))}
                  />
                )}
                <div className="moments-overlay" />
              </div>
            ))}
          </div>

        </div>

        {/* View More Button */}
        <div style={{
          textAlign: "center",
          marginTop: 48,
        }}>
          <Link
            href="/gallery"
            className="moments-btn"
          >
            VIEW MORE
            <span style={{ fontSize: 16 }}>→</span>
          </Link>
        </div>

      </div>

      <style>{`
        .moments-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          height: 560px;
        }

        .moments-large {
          height: 100%;
        }

        .moments-right {
          display: grid;
          grid-template-rows: 1fr 1fr 1fr;
          gap: 16px;
          height: 100%;
        }

        .moments-img:hover {
          transform: scale(1.04);
        }

        .moments-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 50%,
            rgba(0,0,0,0.4) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .moments-large:hover .moments-overlay,
        .moments-right > div:hover .moments-overlay {
          opacity: 1;
        }

        .moments-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #C9A84C;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(201,168,76,0.3);
          padding: 12px 32px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s, gap 0.2s;
        }
        .moments-btn:hover {
          background: #C9A84C;
          color: #111;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .moments-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .moments-large {
            height: 280px;
          }
          .moments-right {
            grid-template-rows: none;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .moments-right > div {
            height: 160px;
          }
          /* Hide 4th photo on mobile — keeps it clean */
          .moments-right > div:last-child {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .moments-right {
            grid-template-columns: 1fr;
          }
          .moments-right > div {
            height: 200px;
          }
          .moments-right > div:last-child {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}

function PlaceholderImage() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#161616", gap: 8,
    }}>
      <span style={{ fontSize: 24, opacity: 0.3 }}>📸</span>
      <p style={{
        fontSize: 10, color: "rgba(255,255,255,0.2)",
        margin: 0, letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        Photo coming soon
      </p>
    </div>
  );
}