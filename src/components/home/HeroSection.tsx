"use client";

import React from "react";
import Link from "next/link";

type HeroSectionProps = {
  videoUrl?: string | null;
};

export default function HeroSection({ videoUrl }: HeroSectionProps) {
  return (
    <>
      <section className="hero-section" style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0a0a0a",
      }}>

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 1,
          }}
        >
          <source src={videoUrl || "/videos/hero.mp4"} type="video/mp4" />
        </video>

        {/* Overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, #0a0a0a 100%)",
        }} />

        {/* Gold left accent */}
        <div style={{
          position: "absolute", left: 0, top: "20%",
          width: 3, height: "35%",
          background: "linear-gradient(180deg, transparent, #C9A84C, transparent)",
          opacity: 0.6,
        }} />

        {/* Content */}
        <div className="hero-content" style={{
          position: "relative", zIndex: 1,
          maxWidth: 1280, margin: "0 auto",
          width: "100%",
        }}>
          <div style={{ maxWidth: 680 }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(0,0,0,0.45)",
              border: "0.5px solid rgba(201,168,76,0.35)",
              borderRadius: 100, padding: "6px 16px", marginBottom: 24,
              backdropFilter: "blur(4px)",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#C9A84C", flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#C9A84C",
                letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                Ethiopia · Addis Ababa
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(40px, 9vw, 90px)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              margin: "0 0 20px 0",
              textShadow: "0 4px 20px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.9)",
            }}>
              <span style={{ display: "block", color: "rgba(255,255,255,0.9)" }}>WELCOME TO</span>
              <span style={{ display: "block", color: "#C9A84C" }}>EAGLE GLOW</span>
            </h1>

            {/* Philosophy tagline */}
            <p style={{
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.9)",
              margin: "0 0 40px 0",
              textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)",
            }}>
              Sight · Mind · Body
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 48,
            }}>
              <Link
                href="/auth/register"
                style={{
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  background: "#C9A84C", color: "#111",
                  fontWeight: 700, fontSize: 13,
                  letterSpacing: "0.08em",
                  padding: "13px 32px",
                  borderRadius: 8, textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(201,168,76,0.35)",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#d9b85a";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#C9A84C";
                  el.style.transform = "translateY(0)";
                }}
              >
                JOIN NOW →
              </Link>
              <Link
                href="/about"
                style={{
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center",
                  background: "transparent", color: "rgba(255,255,255,0.85)",
                  fontWeight: 600, fontSize: 13,
                  letterSpacing: "0.08em",
                  padding: "13px 32px",
                  borderRadius: 8, textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  whiteSpace: "nowrap",
                  transition: "border-color 0.2s, color 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#C9A84C";
                  el.style.color = "#C9A84C";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(255,255,255,0.35)";
                  el.style.color = "rgba(255,255,255,0.85)";
                  el.style.transform = "translateY(0)";
                }}
              >
                LEARN MORE
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              paddingTop: 24,
              borderTop: "0.5px solid rgba(255,255,255,0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: "0 32px",
              width: "fit-content",
            }}>
              {[
                { value: "20+",    label: "Years Experience" },
                { value: "1,000+", label: "Students Trained" },
                { value: "7",      label: "Belt Levels"      },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  position: "relative",
                  paddingRight: i < 2 ? 32 : 0,
                }}>
                  {i < 2 && (
                    <div style={{
                      position: "absolute", right: 0, top: "10%",
                      width: 1, height: "80%",
                      background: "rgba(201,168,76,0.2)",
                    }} />
                  )}
                  <div style={{
                    fontSize: "clamp(22px, 4vw, 34px)",
                    fontWeight: 900, color: "#C9A84C", lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 9, color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    marginTop: 4,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <style>{`
          .hero-section {
            min-height: 100vh;
          }
          .hero-content {
            padding: 140px 24px 80px;
          }
          @media (max-width: 768px) {
            .hero-section {
              min-height: unset;
            }
            .hero-content {
              padding: 80px 24px 60px;
            }
          }
        `}</style>

      </section>

      {/* ── Gold Divider ── */}
      <div style={{
        background: "#0a0a0a",
        lineHeight: 0,
      }}>
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #C9A84C 70%, transparent 100%)",
          opacity: 0.5,
        }} />
      </div>
    </>
  );
}