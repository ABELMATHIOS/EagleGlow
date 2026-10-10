import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallMode =
  | "installed" // already running as an installed app
  | "prompt" // browser can show its native install dialog
  | "ios" // iPhone/iPad: needs the manual Share → Add to Home Screen
  | "none"; // not installable here (e.g. Firefox desktop)

const DISMISS_KEY = "eagleglow-install-dismissed-at";
const DISMISS_DAYS = 14;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    emit();
  });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const iPadOs13Plus =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || iPadOs13Plus;
}

function getMode(): InstallMode {
  if (installed || isStandalone()) return "installed";
  if (deferredPrompt) return "prompt";
  if (isIos()) return "ios";
  return "none";
}

/** Current install state. "none" on the server, so nothing flashes on load. */
export function useInstallMode(): InstallMode {
  return useSyncExternalStore<InstallMode>(subscribe, getMode, () => "none");
}

/** Shows the browser's native install dialog (only when mode is "prompt"). */
export async function promptInstall(): Promise<"accepted" | "dismissed" | null> {
  if (!deferredPrompt) return null;
  const event = deferredPrompt;
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferredPrompt = null; // an event can only be prompted once
  emit();
  return outcome;
}

function wasBannerRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** Hides the floating banner for 14 days. The dashboard card stays available. */
export function dismissBanner() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* storage blocked: banner just shows again next visit */
  }
  emit();
}

export function useBannerDismissed(): boolean {
  // Treated as dismissed on the server so the banner never renders there.
  return useSyncExternalStore(subscribe, wasBannerRecentlyDismissed, () => true);
}