"use client";

import React, { useState } from "react";
import Link from "next/link";

const schedule = [
  {
    day: "Monday",
    short: "MON",
    classes: [
      { time: "6:00 AM",  name: "Wushu",       level: "All Levels",  type: "wushu"   },
      { time: "12:00 PM", name: "Fitness",      level: "All Levels",  type: "fitness" },
      { time: "6:00 PM",  name: "Wushu",        level: "Advanced",    type: "wushu"   },
    ],
  },
  {
    day: "Tuesday",
    short: "TUE",
    classes: [
      { time: "6:00 AM",  name: "Fitness",      level: "All Levels",  type: "fitness" },
      { time: "11:00 AM", name: "Wushu Kids",   level: "Kids",        type: "kids"    },
      { time: "12:30 PM", name: "Wushu",        level: "Beginner",    type: "wushu"   },
    ],
  },
  {
    day: "Wednesday",
    short: "WED",
    classes: [
      { time: "6:00 AM",  name: "Wushu",        level: "All Levels",  type: "wushu"   },
      { time: "12:00 PM", name: "Wushu",        level: "Intermediate", type: "wushu"  },
      { time: "6:00 PM",  name: "Zumba",        level: "All Levels",  type: "fitness" },
    ],
  },
  {
    day: "Thursday",
    short: "THU",
    classes: [
      { time: "6:00 AM",  name: "Fitness",      level: "All Levels",  type: "fitness" },
      { time: "12:00 PM", name: "Tae Bo",       level: "All Levels",  type: "fitness" },
      { time: "6:00 PM",  name: "Wushu",        level: "Advanced",    type: "wushu"   },
    ],
  },
  {
    day: "Friday",
    short: "FRI",
    classes: [
      { time: "6:00 AM",  name: "Wushu",        level: "All Levels",  type: "wushu"   },
      { time: "12:00 PM", name: "Fitness",      level: "All Levels",  type: "fitness" },
      { time: "6:00 PM",  name: "Wushu Kids",   level: "Kids",        type: "kids"    },
    ],
  },
  {
    day: "Saturday",
    short: "SAT",
    classes: [
      { time: "8:00 AM",  name: "Wushu",        level: "All Levels",  type: "wushu"   },
      { time: "10:00 AM", name: "Zumba",        level: "All Levels",  type: "fitness" },
      { time: "12:00 PM", name: "Aerobics",     level: "All Levels",  type: "fitness" },
    ],
  },
];

const typeColors: Record<string, { bg: string; color: string; dot: string }> = {
  wushu:   { bg: "rgba(201,168,76,0.1)",  color: "#C9A84C",             dot: "#C9A84C"             },
  fitness: { bg: "rgba(99,179,237,0.1)",  color: "rgba(99,179,237,0.9)", dot: "rgba(99,179,237,0.9)" },
  kids:    { bg: "rgba(154,205,50,0.1)",  color: "rgba(154,205,50,0.9)", dot: "rgba(154,205,50,0.9)" },
};

export default function SchedulePreview() {
  const [activeDay, setActiveDay] = useState(0);

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

        {/* Day Tabs */}
        <div className="schedule-tabs">
          {schedule.map((day, i) => (
            <button
              key={day.day}
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
              <span className="day-full">{day.day}</span>
              <span className="day-short">{day.short}</span>
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
          {schedule[activeDay].classes.map((cls, i) => {
            const colors = typeColors[cls.type];
            return (
              <div
                key={i}
                className="schedule-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 28px",
                  borderBottom: i < schedule[activeDay].classes.length - 1
                    ? "0.5px solid rgba(255,255,255,0.05)"
                    : "none",
                  transition: "background 0.2s",
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

                {/* Class name + level */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: 15, fontWeight: 700,
                    color: "#fff", margin: "0 0 3px 0",
                  }}>
                    {cls.name}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    margin: 0, letterSpacing: "0.05em",
                  }}>
                    {cls.level}
                  </p>
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
                    {cls.type === "kids" ? "Kids" : cls.type.charAt(0).toUpperCase() + cls.type.slice(1)}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Legend + CTA */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginTop: 28,
        }}>
          {/* Legend */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
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

          {/* CTA */}
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