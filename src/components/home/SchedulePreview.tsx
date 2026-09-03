"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ClassSchedule, ClassTag } from "@/src/types";

// Only these three days show in the Home preview (per the original design) —
// full week is on /classes.
const PREVIEW_DAYS = ["Monday", "Tuesday", "Wednesday"];

const typeColors: Record<string, { bg: string; color: string; dot: string }> = {
  wushu:   { bg: "rgba(201,168,76,0.1)",  color: "#C9A84C",             dot: "#C9A84C"             },
  fitness: { bg: "rgba(99,179,237,0.1)",  color: "rgba(99,179,237,0.9)", dot: "rgba(99,179,237,0.9)" },
};

const TAG_LABELS: Record<ClassTag, string> = {
  kids: "KIDS",
  adult: "ADULT",
  kiremt: "KIREMT",
};

const TAG_COLORS: Record<ClassTag, string> = {
  kids: "#E879C9",
  adult: "#95A5A6",
  kiremt: "#2ECC71",
};

// Parses a time string ("6:00 AM", "17:00", "8:00") into a 24-hour integer
// hour, so we can bucket it into Morning/Evening below. Falls back to 12
// (noon) if the format is unrecognized, rather than throwing.
function parseHour(time: string): number {
  const t = time.trim();
  const ampm = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h;
  }
  const hm = t.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) return parseInt(hm[1], 10);
  return 12;
}

// Just two buckets: before noon is Morning, noon onward is Evening.
function timeOfDay(time: string): 'Morning' | 'Evening' {
  return parseHour(time) < 12 ? 'Morning' : 'Evening';
}

export default function SchedulePreview({ classes }: { classes: ClassSchedule[] }) {
  const days = PREVIEW_DAYS.filter((d) => classes.some((c) => c.day === d));
  const [activeDay, setActiveDay] = useState(0);
  const currentDay = days[activeDay] ?? days[0];

  const dayClasses = classes
    .filter((c) => c.day === currentDay)
    .sort((a, b) => a.time.localeCompare(b.time));

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
              Timetable
            </span>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-0.02em", textTransform: "uppercase",
            color: "#fff", margin: "0 0 12px 0",
          }}>
            OUR <span style={{ color: "#C9A84C" }}>SCHEDULE</span>
          </h2>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.05em", margin: 0,
          }}>
            Find the best time to train with us
          </p>
        </div>

        {days.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
            Schedule coming soon.
          </p>
        ) : (
          <>
            {/* Legend — shown above the day tabs so the color-coding is
                explained before the person sees the badges on each row. */}
            <div style={{
              display: "flex", gap: 20, flexWrap: "wrap",
              justifyContent: "center", marginBottom: 20,
            }}>
              {Object.entries(typeColors).map(([type, colors]) => (
                <div key={type} style={{
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: colors.dot, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 11, color: "rgba(255,255,255,0.35)",
                    textTransform: "capitalize", letterSpacing: "0.05em",
                  }}>
                    {type}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Tabs */}
            <div className="schedule-tabs">
              {days.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(i)}
                  className="schedule-tab"
                  style={{
                    background: activeDay === i
                      ? "#C9A84C"
                      : "rgba(255,255,255,0.04)",
                    color: activeDay === i
                      ? "#111"
                      : "rgba(255,255,255,0.4)",
                    border: activeDay === i
                      ? "1px solid #C9A84C"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    padding: "10px 0",
                    fontWeight: activeDay === i ? 700 : 500,
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flex: 1,
                  }}
                >
                  <span className="day-full">{day}</span>
                  <span className="day-short">{day.slice(0, 3).toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Classes for selected day */}
            <div style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20,
              overflow: "hidden",
              marginTop: 16,
            }}>
              {dayClasses.map((cls, i) => {
                const colors = typeColors[cls.type] ?? typeColors.wushu;
                return (
                  <div
                    key={cls.id}
                    className="schedule-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "20px 28px",
                      borderBottom: i < dayClasses.length - 1
                        ? "0.5px solid rgba(255,255,255,0.05)"
                        : "none",
                      transition: "background 0.2s",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Time */}
                    <div style={{
                      minWidth: 80, flexShrink: 0,
                      fontSize: 13, fontWeight: 600,
                      color: "#C9A84C",
                      letterSpacing: "0.05em",
                    }}>
                      {cls.time}
                    </div>

                    {/* Divider */}
                    <div style={{
                      width: 1, height: 32, flexShrink: 0,
                      background: "rgba(255,255,255,0.06)",
                    }} />

                    {/* Time-of-day + optional group/season tag */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{
                        fontSize: 15, fontWeight: 700,
                        color: "#fff", margin: 0,
                      }}>
                        {timeOfDay(cls.time)}
                      </p>
                      {cls.tag && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.08em",
                          padding: "3px 8px", borderRadius: 100,
                          background: `${TAG_COLORS[cls.tag]}18`,
                          color: TAG_COLORS[cls.tag],
                          border: `0.5px solid ${TAG_COLORS[cls.tag]}40`,
                        }}>
                          {TAG_LABELS[cls.tag]}
                        </span>
                      )}
                    </div>

                    {/* Type badge */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: colors.bg,
                      border: `0.5px solid ${colors.dot}30`,
                      borderRadius: 100,
                      padding: "5px 12px",
                      flexShrink: 0,
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: colors.dot, flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: colors.color,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}>
                        {cls.type}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: 28,
        }}>
          <Link href="/classes" className="schedule-btn">
            VIEW FULL CALENDAR →
          </Link>
        </div>

      </div>

      <style>{`
        .schedule-tabs {
          display: flex;
          gap: 8px;
        }

        .day-short { display: none; }
        .day-full  { display: inline; }

        .schedule-row:hover {
          background: rgba(255,255,255,0.02);
        }

        .schedule-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #C9A84C;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(201,168,76,0.3);
          padding: 10px 24px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .schedule-btn:hover {
          background: #C9A84C;
          color: #111;
        }

        @media (max-width: 768px) {
          .schedule-tabs {
            gap: 6px;
          }
          .schedule-tab {
            padding: 8px 0 !important;
            font-size: 10px !important;
          }
          .day-full  { display: none; }
          .day-short { display: inline; }
          .schedule-row {
            padding: 16px 18px !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .schedule-tabs {
            gap: 4px;
          }
        }
      `}</style>
    </section>
  );
}