"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type OurStoryProps = {
  photoUrl?: string | null;
};

export default function OurStory({ photoUrl }: OurStoryProps) {
  const [imgError, setImgError] = useState(!photoUrl);

  return (
    <section style={{
      background: "#0d0d0d",
      padding: "100px 0",
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 24px",
      }}>
        <div className="story-grid">

          {/* ── Left — Text ── */}
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}>
              <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: "#C9A84C",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                Our Story
              </span>
            </div>

            <h2 style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "#fff",
              margin: "0 0 24px 0",
            }}>
              BUILT ON{" "}
              <span style={{ color: "#C9A84C" }}>DISCIPLINE,</span>
              <br />DRIVEN BY PASSION
            </h2>

            <p style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.85,
              margin: "0 0 16px 0",
            }}>
              EagleGlow was founded in 2002 by Master Endale Melse
              with a vision to create a space where people could grow
              stronger — both in body and mind.
            </p>
            <p style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.85,
              margin: "0 0 36px 0",
            }}>
              What started with a foundation in Chinese martial arts
              later expanded to include modern fitness programs like
              Zumba, Tae Bo, and Aerobics — all guided by the same
              purpose: helping people build confidence, discipline,
              and a sense of community.
            </p>

            <Link
              href="/about"
              className="story-link"
            >
              Learn More
              <span style={{ fontSize: 16 }}>→</span>
            </Link>
          </div>

          {/* ── Right — Master Photo ── */}
          <div className="story-photo-wrapper">

            {/* Decorative gold border */}
            <div className="story-deco-border" />

            {/* Photo */}
            <div className="story-photo" style={{
              position: "relative",
              aspectRatio: "3/4",
              borderRadius: 16,
              overflow: "hidden",
              background: "#1a1a1a",
              border: "0.5px solid rgba(255,255,255,0.08)",
              zIndex: 1,
            }}>
              {imgError ? (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#161616",
                  gap: 12,
                }}>
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}>🥋</div>
                  <p style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.25)",
                    margin: 0,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>Photo coming soon</p>
                </div>
              ) : (
                <Image
                src={photoUrl!}
                alt="Master Endale Melse"
                fill
                style={{ objectFit: "cover" }}
                onError={() => setImgError(true)}
              />
                )}

              {/* Gradient overlay */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "40%",
                background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))",
                zIndex: 2,
              }} />

              {/* Name tag */}
              <div style={{
                position: "absolute",
                bottom: 20, left: 20, right: 20,
                zIndex: 3,
              }}>
                <p style={{
                  fontSize: 15, fontWeight: 700,
                  color: "#fff", margin: "0 0 3px 0",
                }}>
                  Master Endale Melse
                </p>
                <p style={{
                  fontSize: 11, color: "#C9A84C",
                  letterSpacing: "0.1em", margin: 0,
                }}>
                  Founder & Head Master
                </p>
              </div>
            </div>

            {/* Since badge */}
            <div className="since-badge">Since 2002</div>

          </div>
        </div>
      </div>

      <style>{`
        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .story-photo-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .story-photo {
          width: 85%;
        }

        .story-deco-border {
          position: absolute;
          top: 20px;
          right: -12px;
          width: 85%;
          height: 90%;
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 16px;
          z-index: 0;
        }

        .since-badge {
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

        .story-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #C9A84C;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        .story-link:hover {
          gap: 14px;
        }

        @media (max-width: 768px) {
          .story-grid {
            display: flex;
            flex-direction: column;
            gap: 48px;
          }
          .story-photo-wrapper {
            width: 100%;
          }
          .story-photo {
            width: 80%;
          }
          .story-deco-border {
            display: none;
          }
        }
      `}</style>

    </section>
  );
}