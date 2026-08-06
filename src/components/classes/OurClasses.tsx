'use client';

import SectionLabel from '@/src/components/classes/SectionLabel';
import { Handshake } from 'lucide-react';

function YinYang({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#C9A84C" />
      <path d="M50,0 A50,50 0 0,1 50,100 A25,25 0 0,1 50,50 A25,25 0 0,0 50,0" fill="#111111" />
      <circle cx="50" cy="75" r="12.5" fill="#C9A84C" />
      <circle cx="50" cy="25" r="12.5" fill="#111111" />
      <circle cx="50" cy="75" r="4" fill="#111111" />
      <circle cx="50" cy="25" r="4" fill="#C9A84C" />
    </svg>
  );
}

export default function OurClasses() {
  return (
    <>
      <style>{`
        .class-card { transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease; }
        .class-card:hover { transform: translateY(-5px); border-color: rgba(201,168,76,0.35) !important; background: rgba(201,168,76,0.05) !important; }
        .classes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
        @media (max-width: 768px) { .classes-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <section style={{ background: '#0d0d0d', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel text="OUR CLASSES" />
          <h2 style={{
            fontSize: '38px', fontWeight: 800, color: '#fff',
            fontFamily: 'Arial, sans-serif', margin: '0 0 12px', textAlign: 'center',
          }}>
            What We <span style={{ color: '#C9A84C' }}>Offer</span>
          </h2>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Arial, sans-serif', fontSize: '15px', marginBottom: '56px',
          }}>
            Two pillars of training — martial arts mastery and total-body fitness
          </p>

          <div className="classes-grid">

            {/* Wushu */}
            <div className="class-card" style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '40px 36px',
            }}>
              <div style={{ marginBottom: '20px' }}><YinYang size={48} /></div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', fontFamily: 'Arial, sans-serif', marginBottom: '10px' }}>MARTIAL ARTS</div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'Arial, sans-serif', margin: '0 0 16px' }}>Wushu</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif', marginBottom: '28px' }}>
                Rooted in Shaolin tradition, our Wushu program develops strength, precision, and inner focus. Led by Master Endale Melse — open to all ages and skill levels.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Taolu', desc: 'Forms & kata — the art of movement' },
                  { name: 'Sanda', desc: 'Sparring & combat application' },
                ].map(d => (
                  <div key={d.name} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: 'rgba(201,168,76,0.05)',
                    border: '1px solid rgba(201,168,76,0.12)', borderRadius: '10px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'Arial, sans-serif' }}>{d.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif' }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px', padding: '12px 16px', background: 'rgba(201,168,76,0.08)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C' }} />
                <span style={{ fontSize: '12px', color: '#C9A84C', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>Instructor: Master Endale Melse</span>
              </div>
            </div>

            {/* Fitness */}
            <div className="class-card" style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '40px 36px',
            }}>
              <div style={{ fontSize: '44px', marginBottom: '20px', lineHeight: 1 }}>⚡</div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', fontFamily: 'Arial, sans-serif', marginBottom: '10px' }}>FITNESS & WELLNESS</div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'Arial, sans-serif', margin: '0 0 16px' }}>Fitness</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif', marginBottom: '28px' }}>
                High-energy group fitness sessions designed to build endurance, burn calories, and lift your mood. Suitable for all fitness levels — just bring the energy.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Zumba', desc: 'Dance fitness — energetic & fun' },
                  { name: 'Tae Bo', desc: 'Cardio kickboxing & conditioning' },
                  { name: 'Aerobics', desc: 'Classic group cardio training' },
                ].map(d => (
                  <div key={d.name} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: 'rgba(201,168,76,0.05)',
                    border: '1px solid rgba(201,168,76,0.12)', borderRadius: '10px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'Arial, sans-serif' }}>{d.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif' }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Mentorship note — applies to the whole club, not just Wushu, so it sits
              below both cards rather than nested inside either one */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            background: 'rgba(201,168,76,0.06)',
            border: '0.5px solid rgba(201,168,76,0.15)',
            borderRadius: '12px', padding: '16px 24px',
            marginTop: '28px',
          }}>
            <div style={{ flexShrink: 0 }}>
              <Handshake size={18} color="#C9A84C" />
            </div>
            <p style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6, margin: 0, fontFamily: 'Arial, sans-serif',
              textAlign: 'center',
            }}>
              We also provide mentorship to support your personal growth and journey — across every program.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}