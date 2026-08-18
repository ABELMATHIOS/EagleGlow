export type Role             = "guest" | "member" | "admin";
export type Status = "pending" | "active" | "graduated" | "serving" | "paused" | "withdrawn" | "served";
export type RegistrationType = "new" | "training" | "returning";
export type ClassType        = "wushu" | "fitness";
export type TutorialCategory = "taolu" | "kicks" | "sanda" | "gymnastics" | "flexibility" | "general" | "instructor_reference";
export type GalleryCategory  = "graduation" | "competition" | "training";

export interface Belt {
  id:          string;   // e.g. "belt-1"
  name:        string;   // e.g. "White"
  slug:        string;   // e.g. "white" — for URL / lookup use
  color:       string;   // hex swatch used everywhere a belt color chip is shown
  textColor:   string;   // readable text color against `color`
  shadow:      string;   // rgba glow used on the belt pip in Profile
  border?:     string;   // optional accent border (black belt gets a gold border)
  order:       number;   // 1 (White) .. 7 (Black) — progression order
  description: string;
}

export interface AdminNote {
  id:   string;
  date: string;
  note: string;
}

export interface NameCorrectionRequest {
  requestedName: string;
  note:          string;
  submittedAt:   string;
}

export interface User {
  id:                      string;
  name:                    string;
  email:                   string;
  phone?:                  string;
  dateOfBirth?:            string; // ISO date — used for age groups, safety, minors
  sex:                    'male' | 'female';
  heightCm?:               number;
  weightKg?:               number;
  emergencyContactName?:   string;
  emergencyContactPhone?:  string;
  healthNotes?:            string; // sensitive — restrict read access to admin/coach only
  photoUrl?:               string;
  beltId?:                 string; // -> Belt.id
  role:                    Role;
  status:                  Status;
  registrationType:        RegistrationType;
  previousBelt?:           string; // free-text, self-reported at registration (training/returning only)
  yearJoined?:             string; // self-reported, may not match createdAt
  gapReason?:              string; // returning members only
  adminNotes:              AdminNote[];
  nameCorrectionRequest:   NameCorrectionRequest | null;
  createdAt:               string;
}

export interface Tutorial {
  id:              string;
  beltId:          string; // -> Belt.id
  title:           string;
  description?:     string;
  videoUrl?:        string; // absent = not yet recorded/uploaded
  durationMinutes?: number;
  order:           number;
  category:        TutorialCategory;
  published:       boolean;
  createdAt:       string;
}

// Deliberately separate from Tutorial: completion is a fact about a
// (user, tutorial) pair, not a property of the tutorial itself.
export interface TutorialProgress {
  userId:      string;
  tutorialId:  string;
  completed:   boolean;
  completedAt?: string;
}

export interface ClassSchedule {
  id:              string;
  day:             string; // "Monday" .. "Saturday"
  time:            string; // "06:00"
  title:           string;
  type:            ClassType;
  level?:          string;
  instructor?:     string;
  durationMinutes: number;
}

export interface GalleryAlbum {
  id:         string;
  category:   GalleryCategory;
  title:      string;
  subtitle:   string;
  albumUrl:   string | null;
  youtubeId:  string | null;
  videoOnly:  boolean;
  published:  boolean;
  previews:   string[];
}

export type Certificate = {
  id: string;
  url: string;
  caption: string;
};

export type AboutContent = {
  ourStory: string;
  ourVision: string;
  ourMission: string;
  ourGoal: string;
  masterName: string;
  masterTitle: string;
  masterBio: string;
  quoteText: string;
  quoteAuthor: string;
  masterPhotoUrl: string | null;
  certificates: Certificate[];
  updatedAt: string;
};