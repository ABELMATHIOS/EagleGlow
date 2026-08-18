'use client';

import SectionLabel from '@/src/components/contact/SectionLabel';

export default function ContactMain() {
  const INFO = [
    {
      icon: '📍',
      label: 'Address 1',
      value: 'ቦሌ ክፍለ ከተማ ወረዳ 07 | Bole Sub City Woreda 7 Office\nAddis Ababa, Ethiopia',
      link: 'https://maps.app.goo.gl/ekPTsHzhrpQv9uUcA',
      linkText: 'View on Google Maps →',
    },
      {
      icon: '📍',
      label: 'Address 2',
      value: 'Yerer Gulit Market\nAddis Ababa, Ethiopia',
      link: 'https://maps.app.goo.gl/xzdZji11Pec6qvzF9',
      linkText: 'View on Google Maps →',
    },
    {
      icon: '📞',
      label: 'Phone',
      value: '+251-912-052-349',
      link: 'tel:+251-912-052-349',
      linkText: 'Call us',
    },
    {
      icon: '✉️',
      label: 'Email',
      value: 'info.eagleglow@gmail.com',
      link: 'mailto:info.eagleglow@gmail.com',
      linkText: 'Send email',
    },
    {
      icon: '🕐',
      label: 'Opening Hours',
      value: 'Mon – Fri: 6:00 AM – 8:00 PM\nSaturday: 8:00 AM – 6:00 PM\nSunday: Closed',
      link: null,
      linkText: null,
    },
  ];

  return (
    <>
      <style>{`
        .info-card { transition: border-color 0.25s ease, background 0.25s ease; }
        .info-card:hover { border-color: rgba(201,168,76,0.25) !important; background: rgba(201,168,76,0.04) !important; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 700px) { .info-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <section style={{ background: '#0d0d0d', padding: '96px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <SectionLabel text="REACH OUT" />
          <h2 style={{
            fontSize: '38px', fontWeight: 800, color: '#fff',
            fontFamily: 'Arial, sans-serif', margin: '0 0 12px', textAlign: 'center',
          }}>
            Get In <span style={{ color: '#C9A84C' }}>Touch</span>
          </h2>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Arial, sans-serif', fontSize: '15px', marginBottom: '64px',
          }}>
            Come find us, call, or drop by — here's how to reach the club.
          </p>

          <div className="info-grid">
            {INFO.map((item) => (
              <div key={item.label} className="info-card" style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '24px 28px',
                display: 'flex', gap: '18px', alignItems: 'flex-start',
              }}>
                <div style={{ fontSize: '22px', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#C9A84C', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-line' }}>
                    {item.value}
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-block', marginTop: '10px',
                      fontSize: '12px', fontWeight: 700, color: '#C9A84C',
                      fontFamily: 'Arial, sans-serif', letterSpacing: '0.08em',
                      textDecoration: 'none',
                    }}>
                      {item.linkText}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}