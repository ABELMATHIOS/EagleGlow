'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tutorial as DbTutorial } from '@/src/types';
import { BELTS as SHARED_BELTS, getBeltById } from '@/src/data/belts';

/* ============================================================
   TYPES & DATA
   Flat structure: one tutorial list tagged with `belt`, instead
   of one array per belt. Add a tutorial anywhere by pushing one
   object — nothing to duplicate across belts.
   ============================================================ */

type BeltId = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'brown' | 'black';
type Category = 'taolu' | 'kicks' | 'sanda' | 'gymnastics' | 'flexibility';

type Tutorial = {
  id: string;              // unique across ALL belts, e.g. 'white-1'
  belt: BeltId;
  title: string;
  durationMinutes?: number; // omit for instructor-led entries with no video
  description?: string;
  completed: boolean;
  category: Category;
  videoId?: string;        // YouTube video ID — omit for instructor-led, no-video sessions
};

// Derived from the shared belts list; True black (#000) would be invisible
// against this page's near-black (#0a0a0a) background, so black belt keeps
// a lighter charcoal override here for visibility, while sourcing the belt
// name/slug from the same shared data everywhere else uses.
const BELTS: Record<BeltId, { name: string; color: string }> = Object.fromEntries(
  SHARED_BELTS.map((b) => [b.slug, { name: b.name, color: b.slug === 'black' ? '#3A3A3A' : b.color }])
) as Record<BeltId, { name: string; color: string }>;

const CATEGORY_LABEL: Record<Category, string> = {
  taolu:       'Taolu / Forms',
  kicks:       'Kicks',
  sanda:       'Sanda / Fight Skill',
  gymnastics:  'Gymnastics',
  flexibility: 'Flexibility',
};

// Static grading reference — NOT computed from watch progress, no admin
// connection. The instructor gives the real result in person; this is here
// so students know what they're being tested on and roughly what's expected.
// "Discipline" has no tutorials/videos — it's assessed directly by the
// instructor, so it carries a `display` string instead of a `minPercent`.
// Each category has its OWN required minimum — not blended into one combined
// score. A student needs 50%+ in Taolu AND 50%+ in Kicks AND 50%+ in Sanda,
// etc. — a weak category can't be offset by a strong one. All default to the
// same 50% bar here; bump any individual category's number if your program
// wants a specific one to be stricter (e.g. Kicks at 70%).
const GRADING_REQUIREMENTS: Record<BeltId, { category: string; minPercent?: number; display?: string }[]> = {
  white: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
  yellow: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
  green: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
  blue: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
  red: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
  brown: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
  black: [
    { category: 'Taolu / Forms',       minPercent: 50 },
    { category: 'Kicks',               minPercent: 50 },
    { category: 'Sanda / Fight Skill', minPercent: 50 },
    { category: 'Gymnastics',          minPercent: 50 },
    { category: 'Flexibility',         minPercent: 50 },
    { category: 'Discipline',          display: 'Instructor Assessed' },
  ],
};

function formatDuration(minutes?: number): string {
  return minutes != null ? `${minutes} min` : '';
}

/* ============================================================
   ICONS
   ============================================================ */

function CategoryIcon({ category, size = 16 }: { category: Category; size?: number }) {
  const common = {
    width: size, height: size, viewBox: '0 0 20 20', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (category) {
    case 'taolu':
      return <svg {...common}><path d="M10 2 L10 18 M6 5 L14 5" /></svg>;
    case 'kicks':
      return <svg {...common}><path d="M4 16 Q10 2 16 9" /><circle cx="16" cy="9" r="1.4" fill="currentColor" stroke="none" /></svg>;
    case 'sanda':
      return <svg {...common}><path d="M5 5 L15 15 M15 5 L5 15" /></svg>;
    case 'gymnastics':
      return <svg {...common}><path d="M4 12 A8 8 0 1 1 12 4" /></svg>;
    case 'flexibility':
      return <svg {...common}><path d="M4 16 C4 10 16 10 16 4" /></svg>;
    default:
      return <svg {...common}><path d="M10 4 L10 16 M4.5 7 L15.5 13 M15.5 7 L4.5 13" /></svg>;
  }
}

function BeltSeal({ size = 40, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeOpacity={0.5} strokeWidth="1.3" />
      <path d="M10 5.5 L14 10 L10 14.5 L6 10 Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================================================
   SUBCOMPONENTS
   ============================================================ */

function RequirementsPanel({
  beltName, beltColor, requirements,
}: {
  beltName: string;
  beltColor: string;
  requirements: { category: string; minPercent?: number; display?: string }[];
}) {
  if (requirements.length === 0) return null;
  return (
    <div className="req-panel">
      <span className="corner-mark tl" /><span className="corner-mark tr" />
      <span className="corner-mark bl" /><span className="corner-mark br" />

      <div className="req-panel-header">
        <BeltSeal size={34} color={beltColor} />
        <div>
          <p className="req-eyebrow">Belt Grading Requirements</p>
          <p className="req-belt-name">{beltName} Belt</p>
        </div>
      </div>

      <p className="req-note">
        To advance from this belt, you must score 50% or above on every
        test below. Your instructor tests you in person and gives the
        official result — this list is for reference only.
      </p>

      <div className="req-list">
        {requirements.map((r) => (
          <div className="req-row" key={r.category}>
            <span className="req-name">{r.category}</span>
            <span className="req-percent">
              {r.minPercent != null ? `${r.minPercent}%+` : r.display}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChips({
  categories, active, onSelect,
}: {
  categories: Category[];
  active: Category | 'all';
  onSelect: (c: Category | 'all') => void;
}) {
  if (categories.length === 0) return null;
  return (
    <div className="filter-row" role="tablist" aria-label="Filter tutorials by category">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'all'}
        className={`filter-chip${active === 'all' ? ' selected' : ''}`}
        onClick={() => onSelect('all')}
      >All</button>
      {categories.map((cat) => (
        <button
          type="button"
          role="tab"
          aria-selected={active === cat}
          key={cat}
          className={`filter-chip${active === cat ? ' selected' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {CATEGORY_LABEL[cat]}
        </button>
      ))}
    </div>
  );
}

function TutorialRow({
  tutorial, isActive, onToggle,
}: {
  tutorial: Tutorial;
  isActive: boolean;
  onToggle: () => void;
}) {
  const hasVideo = Boolean(tutorial.videoId);
  const panelId = `tutorial-panel-${tutorial.id}`;

  return (
    <div className={`tutorial-row${isActive ? ' active' : ''}`}>
      <button
        type="button"
        className="tutorial-row-main"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={panelId}
      >
        {/* Status icon */}
        <span
          className="status-icon"
          style={{
            background: tutorial.completed ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.05)',
            border: tutorial.completed ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {tutorial.completed ? (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>
              <CategoryIcon category={tutorial.category} size={14} />
            </span>
          )}
        </span>

        {/* Info */}
        <span className="tutorial-info">
          <span className="tutorial-title">{tutorial.title}</span>
          {isActive && tutorial.description && <span className="tutorial-description">{tutorial.description}</span>}
          <span className="tutorial-meta">
            {tutorial.durationMinutes != null
              ? formatDuration(tutorial.durationMinutes)
              : hasVideo
                ? 'Duration TBD'
                : 'In-person session'}
          </span>
          <span className="cat-tag">
            {CATEGORY_LABEL[tutorial.category]}
          </span>
        </span>

        {/* Watch / instructor-led affordance */}
        <span className={`watch-btn${hasVideo ? '' : ' instructor'}`}>
          {hasVideo ? (tutorial.completed ? '↺ Rewatch' : '▶ Watch') : '🧑‍🏫 Details'}
        </span>
      </button>

      {isActive && (
        <div id={panelId} className="tutorial-expanded">
          {hasVideo ? (
            <>
              <div className="video-wrap">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${tutorial.videoId}`}
                  title={tutorial.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${tutorial.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-link"
              >
                Open on YouTube ↗
              </a>
            </>
          ) : (
            <div className="instructor-note">
              <p className="instructor-note-title">Instructor-Led Session</p>
              <p className="instructor-note-body">
                This technique is taught in person by your instructor and is not
                available as a recorded video. Please attend a scheduled class to
                complete this section of your training.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

type TutorialDetailProps = {
  belt: string;
  tutorials: DbTutorial[]; // real Supabase published tutorials, fetched via getPublishedTutorials()
};

export default function TutorialDetail({ belt, tutorials: dbTutorials }: TutorialDetailProps) {
  const beltId = (belt in BELTS ? belt : null) as BeltId | null;
  const beltMeta = beltId ? BELTS[beltId] : { name: 'Unknown', color: '#C9A84C' };

  // Map real Supabase tutorials into this component's display shape.
  // Completion tracking has no real backend yet, so every tutorial is
  // stubbed as not completed until a tutorial_progress table exists.
  const TUTORIALS: Tutorial[] = dbTutorials.map((t) => {
    const beltSlug = getBeltById(t.beltId)?.slug as BeltId | undefined;
    const videoId = t.videoUrl ? t.videoUrl.split('v=')[1] : undefined;
    return {
      id: t.id,
      belt: (beltSlug ?? 'white') as BeltId,
      title: t.title,
      durationMinutes: t.durationMinutes,
      description: t.description,
      completed: false,
      category: t.category as Category,
      videoId,
    };
  });

  const tutorialsForBelt = beltId ? TUTORIALS.filter((t) => t.belt === beltId) : [];
  const requirements = beltId ? GRADING_REQUIREMENTS[beltId] : [];

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  // All categories, every belt — not filtered down to only categories that
  // currently have a tutorial for this belt. Belts with no content in a
  // category will just show an empty list when that chip is selected.
  const presentCategories = Object.keys(CATEGORY_LABEL) as Category[];

  const overallCompleted = tutorialsForBelt.filter((t) => t.completed).length;

  const visibleTutorials = activeCategory === 'all'
    ? tutorialsForBelt
    : tutorialsForBelt.filter((t) => t.category === activeCategory);

  return (
    <>
      <style>{`
        :focus-visible {
          outline: 2px solid #C9A84C;
          outline-offset: 2px;
        }

        .tutorial-row {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .tutorial-row:hover {
          border-color: rgba(255,255,255,0.14);
        }
        .tutorial-row.active {
          border-color: rgba(201,168,76,0.35);
          background: rgba(201,168,76,0.04);
        }
        .tutorial-row-main {
          all: unset;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          cursor: pointer;
        }
        .status-icon {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tutorial-info {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          text-align: left;
        }
        .tutorial-title {
          font-family: Inter, sans-serif; font-weight: 600;
          color: rgba(255,255,255,0.9); font-size: 14px;
          margin-bottom: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tutorial-description {
          font-family: Inter, sans-serif;
          color: rgba(255,255,255,0.55); font-size: 13px;
          line-height: 1.6; margin: 4px 0;
        }
        .tutorial-meta {
          font-family: Inter, sans-serif;
          color: rgba(255,255,255,0.45); font-size: 12px;
        }
        .cat-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: Inter, sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.5);
          margin-top: 6px;
        }

        .watch-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #C9A84C; color: #111;
          border-radius: 8px; padding: 9px 18px;
          font-family: Inter, sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          white-space: nowrap; flex-shrink: 0;
        }
        .watch-btn.instructor {
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.18);
        }

        .tutorial-expanded { padding: 0 24px 22px; }
        .video-wrap {
          position: relative; width: 100%; padding-bottom: 56.25%; height: 0;
          border-radius: 10px; overflow: hidden; background: #000;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .video-wrap iframe {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;
        }
        .youtube-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.5); text-decoration: none;
          margin-top: 10px;
        }
        .youtube-link:hover { color: #C9A84C; }

        .instructor-note {
          border: 1px dashed rgba(201,168,76,0.35);
          background: rgba(201,168,76,0.05);
          border-radius: 10px; padding: 18px 20px;
        }
        .instructor-note-title {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #C9A84C; margin-bottom: 6px;
        }
        .instructor-note-body {
          font-family: Inter, sans-serif; font-size: 13px; line-height: 1.6;
          color: rgba(255,255,255,0.6);
        }

        .back-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: Inter, sans-serif; color: rgba(255,255,255,0.45);
          font-size: 13px; text-decoration: none; margin-bottom: 40px;
        }
        .back-link:hover { color: #C9A84C; }

        .filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 7px 14px;
          cursor: pointer; white-space: nowrap;
        }
        .filter-chip:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.85); }
        .filter-chip.selected {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.35);
          color: #fff;
        }

        .req-panel {
          position: relative;
          background: linear-gradient(180deg, rgba(201,168,76,0.05), rgba(17,17,17,0.4));
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 4px;
          padding: 28px 30px;
          margin-bottom: 28px;
        }
        .corner-mark { position: absolute; width: 14px; height: 14px; }
        .corner-mark.tl { top: 8px; left: 8px; border-top: 1.5px solid #C9A84C; border-left: 1.5px solid #C9A84C; }
        .corner-mark.tr { top: 8px; right: 8px; border-top: 1.5px solid #C9A84C; border-right: 1.5px solid #C9A84C; }
        .corner-mark.bl { bottom: 8px; left: 8px; border-bottom: 1.5px solid #C9A84C; border-left: 1.5px solid #C9A84C; }
        .corner-mark.br { bottom: 8px; right: 8px; border-bottom: 1.5px solid #C9A84C; border-right: 1.5px solid #C9A84C; }

        .req-panel-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .req-eyebrow {
          font-family: Inter, sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(201,168,76,0.75);
        }
        .req-belt-name {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px;
          color: rgba(255,255,255,0.95);
        }
        .req-note {
          font-family: Inter, sans-serif; font-size: 12.5px; line-height: 1.6;
          color: rgba(255,255,255,0.5); margin-bottom: 18px; max-width: 58ch;
        }
        .req-list { display: flex; flex-direction: column; }
        .req-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .req-row:last-child { border-bottom: none; }
        .req-name {
          font-family: Inter, sans-serif; font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.8);
        }
        .req-percent {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 15px;
          color: #C9A84C; white-space: nowrap;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '100px 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          <Link href="/tutorials" className="back-link">← Back to Tutorials</Link>

          {/* Belt header */}
          <div style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: `3px solid ${beltMeta.color}`,
            borderRadius: 20,
            padding: '32px 36px',
            marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <BeltSeal size={48} color={beltMeta.color} />
              <div>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11,
                  color: 'rgba(255,255,255,0.45)', fontWeight: 600,
                  letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4,
                }}>Belt Training</p>
                <h1 style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 700,
                  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                  color: 'rgba(255,255,255,0.95)',
                }}>{beltMeta.name} Belt</h1>
              </div>
            </div>

            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {overallCompleted}/{tutorialsForBelt.length} tutorials watched
            </span>
          </div>

          <RequirementsPanel
            beltName={beltMeta.name}
            beltColor={beltMeta.color}
            requirements={requirements}
          />

          <FilterChips
            categories={presentCategories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleTutorials.map((t) => (
              <TutorialRow
                key={t.id}
                tutorial={t}
                isActive={activeId === t.id}
                onToggle={() => setActiveId(activeId === t.id ? null : t.id)}
              />
            ))}
          </div>

          {visibleTutorials.length === 0 && tutorialsForBelt.length > 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 24px',
              background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                No tutorials in this category yet for this belt.
              </p>
            </div>
          )}

          {tutorialsForBelt.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.6)', marginBottom: 8,
              }}>Belt Locked</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                Complete your current belt to unlock this level.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}