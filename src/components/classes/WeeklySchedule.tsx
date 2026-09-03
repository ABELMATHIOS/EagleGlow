'use client';

import { useState, useMemo } from 'react';
import SectionLabel from '@/src/components/classes/SectionLabel';
import type { ClassSchedule, ClassTag } from '@/src/types';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

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

const TAG_LABELS: Record<ClassTag, string> = {
  kids: 'KIDS',
  adult: 'ADULT',
  kiremt: 'KIREMT',
};

const TAG_COLORS: Record<ClassTag, string> = {
  kids: '#E879C9',
  adult: '#95A5A6',
  kiremt: '#2ECC71',
};

type ClassEntry = {
  time: string;
  type: 'wushu' | 'fitness';
  duration: string;
  tag?: ClassTag;
};

type WeeklyScheduleProps = {
  classes: ClassSchedule[]; // real Supabase classes, fetched via getClasses() in app/classes/page.tsx
};

export default function WeeklySchedule({ classes }: WeeklyScheduleProps) {
  const [activeDay, setActiveDay] = useState('Monday');
  const [filter, setFilter] = useState<'all' | 'wushu' | 'fitness'>('all');

  // Grouped by day from the real classes list passed in as a prop — replaces
  // the old src/data/classes.ts mock import so admin edits actually show up
  // on the public schedule.
  const SCHEDULE: Record<string, ClassEntry[]> = useMemo(() => DAYS.reduce((acc, day) => {
    acc[day] = classes
      .filter((c) => c.day === day)
      .map((c) => ({
        time: c.time,
        type: c.type,
        duration: formatDuration(c.durationMinutes),
        tag: c.tag,
      }));
    return acc;
  }, {} as Record<string, ClassEntry[]>), [classes]);

  const filteredClasses = (SCHEDULE[activeDay] ?? []).filter(
    c => filter === 'all' || c.type === filter
  );

  return (
    <>
      <style>{`
        .day-btn { transition: background 0.2s ease, color 0.2s ease; cursor: pointer; border: none; outline: none; }
        .day-btn:hover { background: rgba(201,168,76,0.1) !important; color: #C9A84C !important; }
        .filter-btn { transition: background 0.2s ease, color 0.2s ease; cursor: pointer; border: none; outline: none; }
        .schedule-row { transition: background 0.2s ease; }
        .schedule-row:hover { background: rgba(201,168,76,0.04) !important; }
        .days-row { display: flex; gap: 10px; justify-content: center; flex-wrap: nowrap; }
        .filter-row { display: flex; gap: 8px; justify-content: center; }
        @media (max-width: 768px) { .days-row { flex-wrap: wrap !important; gap: 8px !important; } }
        @media (max-width: 480px) { .filter-row { flex-wrap: wrap !important; } }
      `}</style>

      <section id="schedule" style={{ background: '#0d0d0d', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel text="WEEKLY SCHEDULE" />
          <h2 style={{
            fontSize: '38px', fontWeight: 800, color: '#fff',
            fontFamily: 'Arial, sans-serif', margin: '0 0 8px', textAlign: 'center',
          }}>
            Class <span style={{ color: '#C9A84C' }}>Timetable</span>
          </h2>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Arial, sans-serif', fontSize: '15px', marginBottom: '48px',
          }}>
            Monday through Saturday — find a session that fits your day
          </p>

          {/* Day selector */}
          <div className="days-row" style={{ marginBottom: '16px' }}>
            {DAYS.map((day) => (
              <button key={day} className="day-btn" onClick={() => setActiveDay(day)} style={{
                padding: '10px 20px', borderRadius: '8px',
                fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em',
                background: activeDay === day ? '#C9A84C' : 'rgba(255,255,255,0.04)',
                color: activeDay === day ? '#111' : 'rgba(255,255,255,0.5)',
              }}>
                {day.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="filter-row" style={{ marginBottom: '32px' }}>
            {(['all', 'wushu', 'fitness'] as const).map((f) => (
              <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
                padding: '6px 16px', borderRadius: '20px',
                fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: filter === f ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                border: filter === f ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.08)',
              }}>
                {f === 'all' ? 'All Classes' : f === 'wushu' ? 'Wushu' : 'Fitness'}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '100px 1fr 100px',
              background: '#1a1a1a', padding: '14px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['Time', 'Session', 'Duration'].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#C9A84C', fontFamily: 'Arial, sans-serif' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {filteredClasses.length > 0 ? filteredClasses.map((cls, i) => (
              <div key={i} className="schedule-row" style={{
                display: 'grid', gridTemplateColumns: '100px 1fr 100px',
                padding: '18px 24px', alignItems: 'center',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                borderBottom: i < filteredClasses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#C9A84C', fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>{cls.time}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontFamily: 'Arial, sans-serif' }}>{timeOfDay(cls.time)}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                    padding: '3px 8px', borderRadius: '4px',
                    background: cls.type === 'wushu' ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.06)',
                    color: cls.type === 'wushu' ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {cls.type === 'wushu' ? 'WUSHU' : 'FITNESS'}
                  </span>
                  {cls.tag && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                      padding: '3px 8px', borderRadius: '4px',
                      background: `${TAG_COLORS[cls.tag]}18`,
                      color: TAG_COLORS[cls.tag],
                      border: `0.5px solid ${TAG_COLORS[cls.tag]}40`,
                      fontFamily: 'Arial, sans-serif',
                    }}>
                      {TAG_LABELS[cls.tag]}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Arial, sans-serif' }}>{cls.duration}</div>
              </div>
            )) : (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                No classes match this filter for {activeDay}.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}