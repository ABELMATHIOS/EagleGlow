import Link from 'next/link';

type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: Section[];
};

export default function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
  
}: LegalPageLayoutProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

        .legal-body * { box-sizing: border-box; }

        .legal-body h2 {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.03em;
          margin: 32px 0 12px;
        }
        .legal-body p {
          font-family: 'Inter', sans-serif;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 12px;
        }
        .legal-body ul {
          margin: 0 0 12px;
          padding-left: 20px;
        }
        .legal-body li {
          font-family: 'Inter', sans-serif;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 8px;
        }
        .legal-body a {
          color: #C9A84C;
          text-decoration: none;
        }
        .legal-body a:hover {
          opacity: 0.8;
        }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        padding: '56px 24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 640,
        }}>
          <Link href="/" style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 12,
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 28,
          }}>
            ← Back to home
          </Link>

          <div style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '44px 40px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: 80, height: 2,
              background: '#C9A84C',
              borderRadius: '0 0 4px 4px',
            }} />

            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: '1.5rem', color: 'rgba(255,255,255,0.95)',
              letterSpacing: '0.06em', marginBottom: 8,
            }}>
              {title}
            </h1>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              marginBottom: 24,
            }}>
              Last updated: {lastUpdated}
            </p>

            <div className="legal-body">
              <p>{intro}</p>

              {sections.map((section) => (
                <div key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs?.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}