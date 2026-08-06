'use client';

import SectionLabel from '@/src/components/classes/SectionLabel';

const ITEMS = [
  { icon: '👟', title: 'Comfortable Footwear', desc: 'Clean indoor training shoes or bare feet for Wushu.' },
  { icon: '👕', title: 'Training Clothes', desc: 'Loose, breathable sportswear. Wushu uniforms available for purchase.' },
  { icon: '💧', title: 'Water Bottle', desc: 'Stay hydrated — sessions are intense and energizing.' },
  { icon: '🧘', title: 'Open Mind', desc: 'Come ready to learn, challenge yourself, and grow.' },
];

export default function WhatToBring() {
  return (
    <>
      <style>{`
        .bring-card { transition: transform 0.25s ease, border-color 0.25s ease; }
        .bring-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.25) !important; }
        .bring-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 768px) { .bring-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .bring-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <section style={{ background: '#0a0a0a', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel text="NEW STUDENTS" />
          <h2 style={{
            fontSize: '34px', fontWeight: 800, color: '#fff',
            fontFamily: 'Arial, sans-serif', margin: '0 0 8px', textAlign: 'center',
          }}>
            What to <span style={{ color: '#C9A84C' }}>Bring</span>
          </h2>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Arial, sans-serif', fontSize: '15px', marginBottom: '48px',
          }}>
            Everything you need for your first class
          </p>
          <div className="bring-grid">
            {ITEMS.map((item) => (
              <div key={item.title} className="bring-card" style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '28px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{item.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Arial, sans-serif', lineHeight: 1.65 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}