"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
const socials = [
  { label: "Telegram",  href: "https://t.me/eagleglow",
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
  { label: "Instagram", href: "https://instagram.com/eagleglow",
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { label: "YouTube",   href: "https://youtube.com/@eagleglow",
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { label: "TikTok",    href: "https://tiktok.com/@eagleglow",
    icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg> },
];

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

        .ft {
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        /* Red diagonal slash — martial energy */
        .ft-slash {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .ft-slash::before {
          content: '';
          position: absolute;
          top: -60px; right: 18%;
          width: 1px; height: 200%;
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.12) 40%, rgba(201,168,76,0.18) 60%, transparent);
          transform: rotate(20deg);
        }
        .ft-slash::after {
          content: '';
          position: absolute;
          top: -60px; right: 22%;
          width: 1px; height: 200%;
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.06) 50%, transparent);
          transform: rotate(20deg);
        }

        /* Top edge — gold + red dual line like a martial belt */
        .ft-edge {
          height: 3px;
          background: linear-gradient(90deg,
            transparent 0%,
            #8B0000 15%,
            #C9A84C 40%,
            #C9A84C 60%,
            #8B0000 85%,
            transparent 100%
          );
          opacity: 0.85;
        }

        .ft-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 36px 28px 28px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 28px;
          position: relative;
          z-index: 1;
        }

        /* Center brand — logo + wordmark, matching the Navbar's treatment */
        .ft-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .ft-logo-ring {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,168,76,0.4);
          box-shadow: 0 0 14px rgba(201,168,76,0.14);
          flex-shrink: 0;
        }
        .ft-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
          gap: 4px;
        }
        .ft-wordmark {
          font-family: 'Cinzel', serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .ft-wordmark span:first-child { color: #fff; }
        .ft-wordmark span:last-child  { color: #C9A84C; }
        .ft-tagline {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
        }

        /* Operating hours — right side of top row, mirrors the socials block */
        .ft-hours {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .ft-hours-label {
          font-size: 9px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.55);
          font-weight: 600;
        }
        .ft-hours-value {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.03em;
        }

        /* Vertical dividers */
        .ft-vdiv {
          width: 1px;
          height: 44px;
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.22), transparent);
          flex-shrink: 0;
        }

        /* Socials */
        .ft-socials { display: flex; gap: 9px; align-items: center; }
        .ft-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 0.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.035);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .ft-icon:hover {
          color: #C9A84C;
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.1);
          transform: translateY(-2px);
        }

        /* Divider between top row and contact strip — a real, visible one */
        .ft-section-div {
          max-width: 1280px;
          margin: 0 auto;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.18) 20%, rgba(201,168,76,0.18) 80%, transparent);
          position: relative;
          z-index: 1;
        }

        /* Contact strip */
        .ft-contact {
          position: relative; z-index: 1;
        }
        .ft-contact-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px 20px;
        }
        .ft-contact-link {
          font-size: 12.5px;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.18s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .ft-contact-link:hover { color: #C9A84C; }

        /* Bottom */
        .ft-bottom {
          border-top: 0.5px solid rgba(255,255,255,0.06);
          position: relative; z-index: 1;
        }
        .ft-bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 10px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .ft-copy {
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          margin: 0;
          letter-spacing: 0.03em;
        }
        .ft-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(201,168,76,0.35);
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .ft-vdiv { display: none; }
          .ft-dot { display: none; }
          .ft-body {
            flex-direction: column;
            gap: 22px;
            padding: 32px 24px 24px;
          }
          .ft-brand { order: -1; }
          .ft-contact-inner {
            flex-direction: column;
            gap: 10px;
          }
          .ft-bottom-inner {
            flex-direction: column;
            gap: 4px;
            text-align: center;
          }
        }
      `}</style>

      <footer className="ft">
        <div className="ft-slash" />
        <div className="ft-edge" />

        <div className="ft-body">

          {/* Socials — left on desktop, second on mobile */}
          <div className="ft-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="ft-icon">
                {s.icon}
              </a>
            ))}
          </div>

          <div className="ft-vdiv" />

          {/* Brand — logo + wordmark, matches the Navbar. First on mobile via CSS order. */}
          <Link href="/" className="ft-brand">
            <div className="ft-logo-ring">
              <Image src="/images/Eagle-Logo.png" alt="EagleGlow" fill sizes="44px" className="object-cover" />
            </div>
            <div className="ft-brand-text">
              <span className="ft-wordmark">
                <span>EAGLE</span><span>GLOW</span>
              </span>
              <span className="ft-tagline">Wushu &amp; Fitness Center</span>
            </div>
          </Link>

          <div className="ft-vdiv" />

          {/* Operating hours — right on desktop, last on mobile */}
          <div className="ft-hours">
            <span className="ft-hours-label">Hours</span>
            <span className="ft-hours-value">Mon–Sat · 8am–8pm</span>
          </div>

        </div>

        <div className="ft-section-div" />

        {/* Contact strip */}
        <div className="ft-contact">
          <div className="ft-contact-inner">
            <a href="tel:+251912052349" className="ft-contact-link">+251-912-052-349</a>
            <div className="ft-dot" />
            <a href="mailto:info.eagleglow@gmail.com" className="ft-contact-link">info.eagleglow@gmail.com</a>
            <div className="ft-dot" />
            <a
            href="https://maps.app.goo.gl/ekPTsHzhrpQv9uUcA"
            target="_blank"
            rel="noopener noreferrer"
            className="ft-contact-link"
          >
            <span className="ft-pin">📍</span>
            <span className="ft-address">
              <strong>Address 1:</strong>
              <span className="ft-address-text">
                 Bole Sub City, Woreda 07 Office
              </span>
            </span>
          </a>

          <a
            href="https://maps.app.goo.gl/xzdZji11Pec6qvzF9"
            target="_blank"
            rel="noopener noreferrer"
            className="ft-contact-link"
          >
            <span className="ft-pin">📍</span>
            <span className="ft-address">
              <strong>Address 2:</strong>
              <span className="ft-address-text">
               Yerer Gulit Market, Addis Ababa
              </span>
            </span>
          </a>
          </div>
        </div>

        <div className="ft-bottom">
          <div className="ft-bottom-inner">
            <p className="ft-copy">© 2025 EagleGlow Wushu & Fitness Center</p>
            <div className="ft-dot" />
            <p className="ft-copy">All rights reserved</p>
          </div>
        </div>
      </footer>
    </>
  );
}