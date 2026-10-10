"use client";

import { useState } from "react";
import { promptInstall, useInstallMode } from "@/src/lib/pwa-install";

/**
 * Small "Install app" button floating in the top-right corner, just under the
 * navbar (same idea as Squoosh). It takes no space in the page and disappears
 * as soon as the app is installed.
 *
 * Styled inline (like the rest of the dashboard) so no global CSS can change
 * its padding or shape.
 */
export default function InstallPrompt() {
  const mode = useInstallMode();
  const [showIosHint, setShowIosHint] = useState(false);

  if (mode !== "prompt" && mode !== "ios") return null;

  const onInstall = () => {
    if (mode === "prompt") {
      void promptInstall();
    } else {
      setShowIosHint((v) => !v);
    }
  };

  return (
    <div
      role="region"
      aria-label="Install the EagleGlow app"
      style={{
        position: "fixed",
        top: 78,
        right: 12,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={onInstall}
        style={{
          background: "#C9A84C",
          color: "#0a0a0a",
          border: "none",
          borderRadius: 6,
          padding: "8px 16px",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
        }}
      >
        Install app
      </button>

      {mode === "ios" && showIosHint && (
        <p
          style={{
            width: 224,
            margin: 0,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(201,168,76,0.4)",
            background: "#111111",
            color: "#bdb8a8",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            lineHeight: 1.45,
            boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
          }}
        >
          Tap the Share button, then <strong>Add to Home Screen</strong>
        </p>
      )}
    </div>
  );
}