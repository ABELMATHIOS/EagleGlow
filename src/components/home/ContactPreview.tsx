"use client";

import React from "react";
import Link from "next/link";

export default function ContactPreview() {
  const contacts = [
    {
  icon: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9A84C"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  label: "Jackros Branch",
  value: "Bole Sub City, Woreda 07 Office",
  href: "https://maps.app.goo.gl/ekPTsHzhrpQv9uUcA",
  external: true,
},
{
  icon: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9A84C"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  label: "Yerer Branch",
  value: "Yerer Gulit Market, Addis Ababa",
  href: "https://maps.google.com/?q=Yerer+Gulit+Market+Addis+Ababa",
  external: true,
},
    {
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: "Call Us",
      value: "+251-912-052-349",
      href: "tel:+251-912-052-349",
      external: false,
    },
    {
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: "Email Us",
      value: "Eagleglow@gmail.com",
      href: "mailto:Eagleglow@gmail.com",
      external: false,
    },
  ];

  return (
    <section style={{ background: "#0d0d0d", padding: "100px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#C9A84C",
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              Reach Out
            </span>
            <div style={{ width: 32, height: 1.5, background: "#C9A84C" }} />
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-0.02em", textTransform: "uppercase",
            color: "#fff", margin: "0 0 12px 0",
          }}>
            GET IN <span style={{ color: "#C9A84C" }}>TOUCH</span>
          </h2>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.05em", margin: 0,
          }}>
            Have questions? We&apos;re here to help
          </p>
        </div>

        {/* Contact Cards */}
        <div className="cards-grid">
          {contacts.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="contact-card"
            >
              <div className="icon-wrap">
                {item.icon}
              </div>
              <p className="card-label">{item.label}</p>
              <p className="card-value">{item.value}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/contact" className="cta-btn">
            Send Us a Message →
          </Link>
        </div>

      </div>

      <style>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .contact-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          padding: 36px 24px;
          background: #111;
          border: 0.5px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          text-decoration: none;
          transition: border-color 0.2s, transform 0.2s;
        }
        .contact-card:hover {
          border-color: rgba(201,168,76,0.3);
          transform: translateY(-3px);
        }

        .icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(201,168,76,0.08);
          border: 0.5px solid rgba(201,168,76,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0;
        }

        .card-value {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          margin: 0;
          line-height: 1.6;
          white-space: pre-line;
        }

        .cta-btn {
          display: inline-block;
          background: #C9A84C;
          color: #111;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          padding: 14px 36px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .cta-btn:hover {
          background: #d9b85a;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
    </section>
  );
}