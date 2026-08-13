import { User } from "@/src/types";

// Mock data — replace with Supabase queries later (`users` table).
// Single source of truth for member data: previously duplicated with
// different field names/shapes in Profile.tsx, Dashboard.tsx and
// AdminMembers.tsx. The "current logged-in member" (CURRENT_USER) and the
// "all members" list (MOCK_MEMBERS) both pull from the same records here so
// there's nothing to keep in sync by hand.
export const MOCK_MEMBERS: User[] = [
  {
    id: "1", name: "Kaleb Haile", email: "kaleb@email.com", phone: "+251-91-111-1111",
    role: "member",sex:"male", status: "pending", registrationType: "new",
    previousBelt: "", yearJoined: "", gapReason: "",
    emergencyContactName: "Selamawit Haile", emergencyContactPhone: "+251-91-111-9999",
    healthNotes: "", beltId: "belt-1", adminNotes: [], nameCorrectionRequest: null,
    createdAt: "2026-05-01",
  },
  {
    id: "2", name: "Meron Tesfaye", email: "meron@email.com", phone: "+251-91-222-2222",
    role: "member",sex:"male", status: "active", registrationType: "returning",
    previousBelt: "Yellow", yearJoined: "2023", gapReason: "Moved for university, resumed after graduating.",
    emergencyContactName: "Abel Tesfaye", emergencyContactPhone: "+251-91-222-9999",
    healthNotes: "", beltId: "belt-2", adminNotes: [], nameCorrectionRequest: null,
    createdAt: "2026-04-20",
  },
  {
    id: "3", name: "Samuel Girma", email: "samuel@email.com", phone: "+251-91-333-3333",
    role: "member",sex:"male", status: "active", registrationType: "training",
    previousBelt: "White", yearJoined: "2024", gapReason: "",
    emergencyContactName: "Hana Girma", emergencyContactPhone: "+251-91-333-9999",
    healthNotes: "", beltId: "belt-3", adminNotes: [], nameCorrectionRequest: null,
    createdAt: "2026-04-01",
  },
  {
    id: "4", name: "Liya Bekele", email: "liya@email.com", phone: "+251-91-444-4444",
    role: "member",sex:"male", status: "pending", registrationType: "new",
    previousBelt: "", yearJoined: "", gapReason: "",
    emergencyContactName: "Tewodros Bekele", emergencyContactPhone: "+251-91-444-9999",
    healthNotes: "", beltId: "belt-1", adminNotes: [], nameCorrectionRequest: null,
    createdAt: "2026-03-18",
  },
  {
    id: "5", name: "Dawit Alemu", email: "dawit@email.com", phone: "+251-91-555-5555",
    role: "member",sex:"male", status: "active", registrationType: "new",
    previousBelt: "", yearJoined: "", gapReason: "",
    emergencyContactName: "Rahel Alemu", emergencyContactPhone: "+251-91-555-9999",
    healthNotes: "", beltId: "belt-4", adminNotes: [], nameCorrectionRequest: null,
    createdAt: "2026-03-08",
  },
];

// The mock "logged-in member" both Profile.tsx and Dashboard.tsx render —
// pulled from the same list above, once a backend exists this is just
// whoever the session belongs to.
export const CURRENT_USER: User = {
  id: "1001", name: "Yonas Tadesse", email: "yonas@gmail.com", phone: "+251-911-234-567",
  role: "member", sex:"male", status: "active", registrationType: "new",
  previousBelt: "", yearJoined: "2022", gapReason: "",
  emergencyContactName: "Selam Tadesse", emergencyContactPhone: "+251-911-987-654",
  healthNotes: "", photoUrl: undefined, beltId: "belt-3", adminNotes: [],
  nameCorrectionRequest: null, createdAt: "2022-03-01",
};

export const getMemberById = (id: string) => MOCK_MEMBERS.find((m) => m.id === id);