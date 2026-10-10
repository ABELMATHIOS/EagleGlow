'use client';

import { useState } from 'react';
import { promptInstall, useInstallMode } from '@/src/lib/pwa-install';

/**
 * "Install App" card for the member dashboards. Uses the same .quick-link
 * look as the other cards. Renders nothing when the app is already installed
 * or the browser can't install it.
 */
export default function InstallButton() {
  const mode = useInstallMode();
  const [showIosHint, setShowIosHint] = useState(false);

  if (mode !== 'prompt' && mode !== 'ios') return null;

  const onClick = () => {
    if (mode === 'prompt') {
      void promptInstall();
    } else {
      setShowIosHint((v) => !v);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="quick-link"
      style={{ width: '100%', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
    >
      <div>
        <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
          Install App
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          {mode === 'ios' && showIosHint
            ? 'Tap the Share button, then "Add to Home Screen"'
            : 'Add EagleGlow to your home screen'}
        </p>
      </div>
      <span style={{ color: '#C9A84C', fontSize: 20 }}>↓</span>
    </button>
  );
}