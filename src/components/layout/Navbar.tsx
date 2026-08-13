"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { getCurrentSessionRole, signOut } from "@/src/lib/auth";

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Gallery",    href: "/gallery", desktopOnly: true },
  { label: "Classes",    href: "/classes" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [role,     setRole]     = useState<"guest" | "member" | "admin">("guest");

  const pathname  = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Real session read — re-checks on every route change so Navbar updates
  // right after a login redirect or logout.
  useEffect(() => {
    let cancelled = false;
    getCurrentSessionRole().then((sessionRole) => {
      if (!cancelled) setRole(sessionRole);
    });
    return () => { cancelled = true; };
  }, [pathname]);

  const isLoggedIn = role === "member" || role === "admin";
  const accountHref = role === "admin" ? "/admin" : "/dashboard";

  const handleLogout = async () => {
    await signOut();
    setRole("guest");
    setIsOpen(false);
    window.location.href = "/";
  };

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handleKey);
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

        :root {
          --gold: #C9A84C;
          --gold-hover: #d9b85a;
          --gold-dim: rgba(201,168,76,0.12);
          --gold-border: rgba(201,168,76,0.25);
        }

        .nav-link {
          position: relative;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 0.2s;
          padding-bottom: 2px;
          letter-spacing: 0.02em;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          width: 0; height: 1px;
          background: var(--gold);
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: var(--gold); }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active { color: var(--gold); }
        .nav-link.active::after { width: 100%; }

        .drawer-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: background 0.18s, color 0.18s;
          border: 1px solid transparent;
          letter-spacing: 0.02em;
        }
        .drawer-link:hover { background: var(--gold-dim); color: var(--gold); }
        .drawer-link.active { color: var(--gold); background: var(--gold-dim); border-color: var(--gold-border); }

        .btn-register {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 7px 20px; border-radius: 7px;
          font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em;
          text-decoration: none;
          color: var(--gold);
          border: 1px solid var(--gold);
          background: transparent;
          transition: background 0.18s, color 0.18s;
        }
        .btn-register:hover { background: var(--gold); color: #111; }

        .btn-login {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 7px 20px; border-radius: 7px;
          font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em;
          text-decoration: none;
          background: var(--gold); color: #111; border: none;
          box-shadow: 0 2px 10px rgba(201,168,76,0.28);
          transition: background 0.18s, box-shadow 0.18s;
        }
        .btn-login:hover { background: var(--gold-hover); box-shadow: 0 4px 16px rgba(201,168,76,0.4); }

        .hamburger {
          padding: 7px; color: rgba(255,255,255,0.6);
          background: transparent; border: none; border-radius: 7px;
          cursor: pointer; transition: color 0.18s, background 0.18s;
        }
        .hamburger:hover { color: #fff; background: rgba(255,255,255,0.07); }

        /* dual-tone bottom edge — matches footer top edge */
        .nav-edge {
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            #6b0000 10%,
            var(--gold) 35%,
            var(--gold) 65%,
            #6b0000 90%,
            transparent 100%
          );
          opacity: 0.7;
        }

        @media (min-width: 768px) {
          .tablet-show { display: flex !important; }
        }

        @media (min-width: 1024px) {
          .desktop-only-link { display: inline !important; }
          .desktop-only-btn { display: inline-flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 65,
        transition: "background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s",
        background: scrolled
          ? "rgba(10,10,10,0.96)"
          : "linear-gradient(135deg, #0a0a0a 0%, #1a1610 45%, #0f0e0a 100%)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.6)" : "none",
      }}>
        <div className="nav-edge" />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
              <div style={{
                position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden",
                border: "1.5px solid rgba(201,168,76,0.4)",
                boxShadow: "0 0 12px rgba(201,168,76,0.12)",
                flexShrink: 0,
              }}>
                <Image src="/images/Eagle-Logo.png" alt="EagleGlow" fill className="object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 3 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, letterSpacing: "0.08em" }}>
                  <span style={{ color: "#fff" }}>EAGLE</span>
                  <span style={{ color: "var(--gold)" }}>GLOW</span>
                </span>
                <span style={{ fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                  Wushu & Fitness Center
                </span>
              </div>
            </Link>

            {/* Desktop/Tablet nav */}
            <div style={{ display: "none" }} className="tablet-show">
              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn("nav-link", pathname === link.href && "active", link.desktopOnly && "desktop-only-link")}
                    style={link.desktopOnly ? { display: "none" } : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

           {/* Desktop/Tablet right */}
            <div style={{ display: "none" }} className="tablet-show">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {isLoggedIn ? (
                  <>
                    <Link href={accountHref} className="btn-login desktop-only-btn">
                      {role === "admin" ? "Admin" : "Dashboard"}
                    </Link>
                    <button onClick={handleLogout} className="btn-login desktop-only-btn" style={{ cursor: "pointer" }}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/register" className="btn-register">Join Now</Link>
                    <Link href="/auth/login" className="btn-login desktop-only-btn">Login</Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile controls */}
            <div className="mobile-only" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button className="hamburger" onClick={() => setIsOpen(true)}
                aria-label="Open navigation menu" aria-expanded={isOpen} aria-controls="mobile-drawer">
                <Menu size={20} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div onClick={() => setIsOpen(false)} aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }} />

      {/* ══ MOBILE DRAWER — compact, top-right, not full height ══ */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: "fixed",
          /* sits just below the navbar */
          top: 64, right: 12,
          width: 240,
          zIndex: 70,
          background: "#0f0e0b",
          border: "0.5px solid rgba(201,168,76,0.2)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
          overflow: "hidden",
          /* slides down from the navbar edge */
          transformOrigin: "top right",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(-8px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "transform 0.22s cubic-bezier(0.32,0.72,0,1), opacity 0.22s ease",
        }}
      >
        {/* Top gold line — matches nav + footer */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, #6b0000 15%, var(--gold) 40%, var(--gold) 60%, #6b0000 85%, transparent)",
          opacity: 0.7,
        }} />

        {/* Close row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 8px" }}>
          <Link href="/" onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              position: "relative", width: 28, height: 28, borderRadius: "50%", overflow: "hidden",
              border: "1.5px solid rgba(201,168,76,0.4)",
              boxShadow: "0 0 10px rgba(201,168,76,0.12)",
              flexShrink: 0,
            }}>
              <Image src="/images/Eagle-Logo.png" alt="EagleGlow" fill className="object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>
                <span style={{ color: "#fff" }}>EAGLE</span><span style={{ color: "var(--gold)" }}>GLOW</span>
              </span>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} aria-label="Close menu"
            style={{ padding: 5, background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", color: "rgba(255,255,255,0.4)", transition: "color 0.18s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Links */}
        <nav style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn("drawer-link", pathname === link.href && "active")}>
              {link.label}
              {pathname === link.href && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div style={{
          padding: "8px 10px 12px",
          borderTop: "0.5px solid rgba(201,168,76,0.1)",
          display: "flex", gap: 8,
        }}>
          {isLoggedIn ? (
            <>
              <Link href={accountHref} className="btn-login" style={{ flex: 1, justifyContent: "center", padding: "9px 0", fontSize: 12 }} onClick={() => setIsOpen(false)}>
                {role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <button onClick={handleLogout} className="btn-login" style={{ flex: 1, justifyContent: "center", padding: "9px 0", fontSize: 12, cursor: "pointer" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/register" className="btn-register" style={{ flex: 1, justifyContent: "center", padding: "9px 0", fontSize: 12 }} onClick={() => setIsOpen(false)}>
                Join Now
              </Link>
              <Link href="/auth/login" className="btn-login" style={{ flex: 1, justifyContent: "center", padding: "9px 0", fontSize: 12 }} onClick={() => setIsOpen(false)}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}