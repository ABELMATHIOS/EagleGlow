'use client';

import { useState } from 'react';
import SectionLabel from '@/src/components/classes/SectionLabel';
import { CLASSES as SHARED_CLASSES, DAYS, formatDuration } from '@/src/data/classes';

type ClassEntry = {
  time: string;
  name: string;
  type: 'wushu' | 'fitness';
  duration: string;
  level?: string;
};

// Grouped by day from the single shared classes list (src/data/classes.ts),
// which also carries a stable `id` per class — this local view just keeps
// the display-friendly `name`/`duration` (string) shape the table already
// used.
const SCHEDULE: Record<string, ClassEntry[]> = DAYS.reduce((acc, day) => {
  acc[day] = SHARED_CLASSES
    .filter((c) => c.day === day)
    .map((c) => ({
      time: c.time,
      name: c.title,
      type: c.type,
      duration: formatDuration(c.durationMinutes),
      level: c.level,
    }));
  return acc;
}, {} as Record<string, ClassEntry[]>);

export default function WeeklySchedule() {
  const [activeDay, setActiveDay] = useState('Monday');
  const [filter, setFilter] = useState<'all' | 'wushu' | 'fitness'>('all');

  const filteredClasses = SCHEDULE[activeDay].filter(
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
              display: 'grid', gridTemplateColumns: '100px 1fr 100px 120px',
              background: '#1a1a1a', padding: '14px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['Time', 'Class', 'Duration', 'Level'].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#C9A84C', fontFamily: 'Arial, sans-serif' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {filteredClasses.length > 0 ? filteredClasses.map((cls, i) => (
              <div key={i} className="schedule-row" style={{
                display: 'grid', gridTemplateColumns: '100px 1fr 100px 120px',
                padding: '18px 24px', alignItems: 'center',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                borderBottom: i < filteredClasses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#C9A84C', fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>{cls.time}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontFamily: 'Arial, sans-serif' }}>{cls.name}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                    padding: '3px 8px', borderRadius: '4px',
                    background: cls.type === 'wushu' ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.06)',
                    color: cls.type === 'wushu' ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {cls.type === 'wushu' ? 'WUSHU' : 'FITNESS'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Arial, sans-serif' }}>{cls.duration}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif' }}>{cls.level ?? '—'}</div>
              </div>
            )) : (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                No classes match this filter for {activeDay}.
              </div>
            )}
          </div>

          {/* Instructor note */}
          <div style={{
            marginTop: '24px', padding: '16px 20px',
            background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)',
            borderLeft: '3px solid #C9A84C', borderRadius: '0 8px 8px 0',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>🥋</span>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
              <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Master Endale Melse</strong> personally leads all sessions.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}