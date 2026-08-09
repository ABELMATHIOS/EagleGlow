import { Belt } from "@/src/types";

// Mock data — replace with a Supabase query later (`belts` table).
// Single source of truth for belt info: previously duplicated with different
// shapes in Register.tsx, Profile.tsx, Dashboard.tsx, AdminMembers.tsx and
// AdminTutorials.tsx. Everything that needs belt names/colors/order should
// import from here instead of redefining its own list.
export const BELTS: Belt[] = [
  { id: "belt-1", name: "White",  slug: "white",  color: "#FFFFFF", textColor: "#111111", shadow: "rgba(255,255,255,0.4)", order: 1, description: "Introductory belt — foundational stances and etiquette." },
  { id: "belt-2", name: "Yellow", slug: "yellow", color: "#FFD700", textColor: "#111111", shadow: "rgba(255,215,0,0.4)",   order: 2, description: "Intermediate stances and combination strikes." },
  { id: "belt-3", name: "Green",  slug: "green",  color: "#2ECC71", textColor: "#111111", shadow: "rgba(34,197,94,0.4)",  order: 3, description: "Advanced footwork, kicks, and introductory sparring." },
  { id: "belt-4", name: "Blue",   slug: "blue",   color: "#3498DB", textColor: "#FFFFFF", shadow: "rgba(59,130,246,0.4)", order: 4, description: "Intermediate combat techniques and forms." },
  { id: "belt-5", name: "Red",    slug: "red",    color: "#E74C3C", textColor: "#FFFFFF", shadow: "rgba(239,68,68,0.4)",  order: 5, description: "Advanced kicks and sparring drills." },
  { id: "belt-6", name: "Brown",  slug: "brown",  color: "#8B4513", textColor: "#FFFFFF", shadow: "rgba(139,69,19,0.4)",  order: 6, description: "Pre-black belt refinement across all disciplines." },
  { id: "belt-7", name: "Black",  slug: "black",  color: "#1a1a1a", textColor: "#C9A84C", shadow: "rgba(201,168,76,0.5)", border: "#C9A84C", order: 7, description: "Mastery level." },
];

export const getBeltById   = (id: string)   => BELTS.find((b) => b.id === id);
export const getBeltBySlug = (slug: string) => BELTS.find((b) => b.slug === slug);
export const getBeltByOrder = (order: number) => BELTS.find((b) => b.order === order);