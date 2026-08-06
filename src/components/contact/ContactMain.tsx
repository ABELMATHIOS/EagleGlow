'use client';

import { useState } from 'react';
import SectionLabel from '@/src/components/contact/SectionLabel';

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export default function ContactMain() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [focused, setFocused] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitState('sending');
    setTimeout(() => setSubmitState('success'), 1500);
  }

  const inputStyle = (name: string) => ({
    width: '100%',
    padding: '13px 14px',
    background: focused === name ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.04)',
    border: focused === name ? '1px solid rgba(201,168,76,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease, background 0.2s ease',
    boxSizing: 'border-box' as const,
  });

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
      value: 'Eagleglow@gmail.com',
      link: 'mailto:Eagleglow@gmail.com',
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

  const SUBJECTS = [
    'General Inquiry',
    'Class Registration',
    'Schedule Information',
    'Membership & Fees',
    'Private Training',
    'Other',
  ];

  return (
    <>
      <style>{`
        .info-card { transition: border-color 0.25s ease, background 0.25s ease; }
        .info-card:hover { border-color: rgba(201,168,76,0.25) !important; background: rgba(201,168,76,0.04) !important; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <section style={{ background: '#0d0d0d', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            Have a question or ready to start training? We're here for you.
          </p>

          <div className="contact-grid">

            {/* LEFT — Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            {/* RIGHT — Contact Form */}
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '40px 36px',
            }}>
              {submitState === 'success' ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', fontFamily: 'Arial, sans-serif', margin: '0 0 12px' }}>Message Sent!</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif', lineHeight: 1.7 }}>
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitState('idle'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    style={{
                      marginTop: '28px', padding: '12px 28px',
                      background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                      borderRadius: '8px', color: '#C9A84C', fontFamily: 'Arial, sans-serif',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em',
                    }}
                  >
                    SEND ANOTHER
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: 'Arial, sans-serif', margin: '0 0 28px' }}>
                    Send a <span style={{ color: '#C9A84C' }}>Message</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Name + Email row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
                          FULL NAME <span style={{ color: '#C9A84C' }}>*</span>
                        </label>
                        <input
                          name="name" value={form.name} onChange={handleChange}
                          onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                          placeholder="Your name"
                          style={inputStyle('name')}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
                          EMAIL <span style={{ color: '#C9A84C' }}>*</span>
                        </label>
                        <input
                          name="email" value={form.email} onChange={handleChange}
                          onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                          placeholder="your@email.com" type="email"
                          style={inputStyle('email')}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
                        PHONE <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span>
                      </label>
                      <input
                        name="phone" value={form.phone} onChange={handleChange}
                        onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                        placeholder="+251 900 000 000" type="tel"
                        style={inputStyle('phone')}
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
                        SUBJECT <span style={{ color: '#C9A84C' }}>*</span>
                      </label>
                      <select
                        name="subject" value={form.subject} onChange={handleChange}
                        onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                        style={{ ...inputStyle('subject'), appearance: 'none' as const }}
                      >
                        <option value="" disabled style={{ background: '#1a1a1a' }}>Select a subject</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s} style={{ background: '#1a1a1a' }}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
                        MESSAGE <span style={{ color: '#C9A84C' }}>*</span>
                      </label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange}
                        onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                        placeholder="Tell us how we can help..."
                        rows={5}
                        style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '120px' }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={submitState === 'sending'}
                      style={{
                        width: '100%', padding: '14px',
                        background: submitState === 'sending' ? 'rgba(201,168,76,0.5)' : '#C9A84C',
                        color: '#111', fontFamily: 'Arial, sans-serif',
                        fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em',
                        borderRadius: '10px', border: 'none', cursor: submitState === 'sending' ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {submitState === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
                    </button>

                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}