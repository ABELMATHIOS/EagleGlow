'use client';

import { useState, useMemo } from 'react';
import SectionLabel from '@/src/components/classes/SectionLabel';
import type { ClassSchedule, ClassTag } from '@/src/types';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
  endTime?: string;
  type: 'wushu' | 'fitness' | 'sanda';
  location?: string;
  tag?: ClassTag;
};

type WeeklyScheduleProps = {
  classes: ClassSchedule[];
};

export default function WeeklySchedule({ classes }: WeeklyScheduleProps) {
  const [activeDay, setActiveDay] = useState('Monday');
  const [filter, setFilter] = useState<'all' | 'wushu' | 'fitness' | 'sanda'>('all');

  const SCHEDULE: Record<string, ClassEntry[]> = useMemo(() => DAYS.reduce((acc, day) => {
    acc[day] = classes
      .filter((c) => c.day === day)
      .map((c) => ({
        time: c.time,
        endTime: c.endTime,
        type: c.type,
        location: c.location,
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
        .days-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
        .filter-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 32px; }
        @media (max-width: 480px) {
          .days-row { grid-template-columns: repeat(3, 1fr); }
          .filter-row { grid-template-columns: repeat(2, 1fr); }
        }
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
                padding: '10px 4px', borderRadius: '8px',
                fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.05em', width: '100%',
                background: activeDay === day ? '#C9A84C' : 'rgba(255,255,255,0.04)',
                color: activeDay === day ? '#111' : 'rgba(255,255,255,0.5)',
              }}>
                {day.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="filter-row">
            {(['all', 'wushu', 'fitness', 'sanda'] as const).map((f) => (
              <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
                padding: '6px 4px', borderRadius: '20px',
                fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', width: '100%',
                background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: filter === f ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                border: filter === f ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.08)',
              }}>
                {f === 'all' ? 'All' : f === 'wushu' ? 'Wushu' : f === 'fitness' ? 'Fitness' : 'Sanda'}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '90px 1fr auto',
              gap: 8, padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: '#1a1a1a',
            }}>
              {['TIME', 'SESSION', 'LOCATION'].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#C9A84C', fontFamily: 'Arial, sans-serif' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {filteredClasses.length > 0 ? filteredClasses.map((cls, i) => (
              <div key={i} className="schedule-row" style={{
                display: 'grid', gridTemplateColumns: '90px 1fr auto',
                gap: 8, padding: '14px 16px', alignItems: 'center',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                borderBottom: i < filteredClasses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>

                {/* Time */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                    {cls.time}
                  </div>
                  {cls.endTime && (
                    <div style={{ fontSize: 11, color: 'rgba(201,168,76,0.6)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                      — {cls.endTime}
                    </div>
                  )}
                </div>

                {/* Session */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'Arial, sans-serif' }}>
                    {timeOfDay(cls.time)}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '2px 7px', borderRadius: 100,
                    background: cls.type === 'wushu' ? 'rgba(201,168,76,0.12)' : cls.type === 'sanda' ? 'rgba(231,76,60,0.12)' : 'rgba(99,179,237,0.12)',
                    color: cls.type === 'wushu' ? '#C9A84C' : cls.type === 'sanda' ? '#E74C3C' : 'rgba(99,179,237,0.9)',
                    border: `0.5px solid ${cls.type === 'wushu' ? 'rgba(201,168,76,0.3)' : cls.type === 'sanda' ? 'rgba(231,76,60,0.3)' : 'rgba(99,179,237,0.3)'}`,
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {cls.type.toUpperCase()}
                  </span>
                  {cls.tag && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                      padding: '2px 7px', borderRadius: 100,
                      background: `${TAG_COLORS[cls.tag]}18`,
                      color: TAG_COLORS[cls.tag],
                      border: `0.5px solid ${TAG_COLORS[cls.tag]}40`,
                      fontFamily: 'Arial, sans-serif',
                    }}>
                      {TAG_LABELS[cls.tag]}
                    </span>
                  )}
                </div>

                {/* Location */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                  {cls.location ?? '—'}
                </div>

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