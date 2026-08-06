"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Handshake } from "lucide-react";

const programs = [
  {
    id: "wushu",
    tag: "Traditional",
    title: "WUSHU",
    subtitle: "Martial Arts Program",
    description:
      "Our Wushu program builds strength and discipline through Taolu (Forms) and Sanda (Sparring), blending ancient tradition with modern training methods.",
    disciplines: ["Taolu", "Sanda", "Sparring"],
    note: "We also provide mentorship to support your personal growth and journey.",
  },
  {
    id: "fitness",
    tag: "Modern",
    title: "FITNESS",
    subtitle: "Fitness Program",
    description:
      "Our Fitness program brings energy and fun through Tae Bo, Zumba, and Aerobics — helping you stay active, strong, and motivated every session.",
    disciplines: ["Zumba", "Tae Bo", "Aerobics"],
    note: null,
  },
];

function YinYang({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* Outer circle — gold */}
      <circle cx="50" cy="50" r="50" fill="#C9A84C" />
      {/* Black half */}
      <path
        d="M50,0 A50,50 0 0,1 50,100 A25,25 0 0,1 50,50 A25,25 0 0,0 50,0"
        fill="#111111"
      />
      {/* Small gold circle on black half */}
      <circle cx="50" cy="75" r="12.5" fill="#C9A84C" />
      {/* Small black circle on gold half */}
      <circle cx="50" cy="25" r="12.5" fill="#111111" />
      {/* Tiny black dot on gold circle */}
      <circle cx="50" cy="75" r="4" fill="#111111" />
      {/* Tiny gold dot on black circle */}
      <circle cx="50" cy="25" r="4" fill="#C9A84C" />
    </svg>
  );
}

function FitnessIcon({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Dumbbell shape */}
      <rect x="35" y="44" width="30" height="12" rx="4" fill="#C9A84C" />
      <rect x="10" y="34" width="16" height="32" rx="6" fill="#C9A84C" />
      <rect x="74" y="34" width="16" height="32" rx="6" fill="#C9A84C" />
      <rect x="8" y="40" width="12" height="20" rx="4" fill="#C9A84C" opacity="0.6" />
      <rect x="80" y="40" width="12" height="20" rx="4" fill="#C9A84C" opacity="0.6" />
    </svg>
  );
}

export default function OurProgram() {
  const [active, setActive] = useState<string | null>(null);

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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            gap: 10, marginBottom: 16,
          }}>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#C9A84C",
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              What We Offer
            </span>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-0.02em", textTransform: "uppercase",
            color: "#fff", margin: "0 0 12px 0",
          }}>
            OUR <span style={{ color: "#C9A84C" }}>PROGRAM</span>
          </h2>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.05em", margin: 0,
          }}>
            Choose your perfect training path
          </p>
        </div>

        {/* Program Cards */}
        <div className="program-grid">
          {programs.map((program) => (
            <div
              key={program.id}
              className="program-card"
              style={{
                position: "relative",
                background: active === program.id
                  ? "rgba(201,168,76,0.06)"
                  : "#111111",
                border: active === program.id
                  ? "1px solid rgba(201,168,76,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: "36px 32px",
                transition: "background 0.3s, border-color 0.3s",
                overflow: "hidden",
              }}
              onMouseEnter={() => setActive(program.id)}
              onMouseLeave={() => setActive(null)}
            >

              {/* Watermark background icon */}
              <div style={{
                position: "absolute",
                right: 20, top: 20,
                opacity: active === program.id ? 0.07 : 0.03,
                transition: "opacity 0.3s",
                pointerEvents: "none",
              }}>
                {program.id === "wushu"
                  ? <YinYang size={100} />
                  : <FitnessIcon size={100} />
                }
              </div>

              {/* Top row */}
              <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: 20,
              }}>
                <div>
                  <span style={{
                    display: "inline-block",
                    fontSize: 9, fontWeight: 600,
                    color: "#C9A84C",
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    background: "rgba(201,168,76,0.1)",
                    border: "0.5px solid rgba(201,168,76,0.2)",
                    borderRadius: 100, padding: "3px 10px",
                    marginBottom: 12,
                  }}>
                    {program.tag}
                  </span>
                  <h3 style={{
                    fontSize: "clamp(28px, 3vw, 40px)",
                    fontWeight: 900, color: "#fff",
                    letterSpacing: "-0.02em", textTransform: "uppercase",
                    margin: "0 0 4px 0", lineHeight: 1,
                  }}>
                    {program.title}
                  </h3>
                  <p style={{
                    fontSize: 11, color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.1em", margin: 0,
                  }}>
                    {program.subtitle}
                  </p>
                </div>

                {/* Icon — top right */}
                <div style={{ flexShrink: 0 }}>
                  {program.id === "wushu"
                    ? <YinYang size={44} />
                    : <FitnessIcon size={44} />
                  }
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: 13.5,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.8,
                margin: "0 0 24px 0",
              }}>
                {program.description}
              </p>

              {/* Discipline tags */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8,
                marginBottom: program.note ? 20 : 0,
              }}>
                {program.disciplines.map((d) => (
                  <span key={d} style={{
                    fontSize: 11, fontWeight: 500,
                    color: "rgba(255,255,255,0.5)",
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 6, padding: "5px 12px",
                  }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Mentorship note — Wushu only */}
              {program.note && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "rgba(201,168,76,0.06)",
                  border: "0.5px solid rgba(201,168,76,0.15)",
                  borderRadius: 10, padding: "12px 14px",
                  marginTop: 20,
                }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <Handshake size={16} color="#C9A84C" />
                  </div>
                  <p style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.6, margin: 0,
                  }}>
                    {program.note}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/classes" className="program-btn">
            VIEW ALL CLASSES
            <span style={{ fontSize: 16 }}>→</span>
          </Link>
        </div>

      </div>

      <style>{`
        .program-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .program-btn {
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
        .program-btn:hover {
          background: #C9A84C;
          color: #111;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .program-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}