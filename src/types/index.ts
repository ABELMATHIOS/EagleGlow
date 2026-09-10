export type Role             = "guest" | "member" | "admin" | "super_admin";
export type Status = "pending" | "active" | "graduated" | "serving" | "paused" | "withdrawn" | "served";
export type RegistrationType = "new" | "existing";
export type ClassType = "wushu" | "fitness" | "sanda";
export type Program          = "wushu" | "fitness" | "sanda";
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

// Sanda's equivalent of Belt — admin-manageable, but not a
// progression ladder (no order-based promotion logic). Conditioning is
// just a normal row here alongside Sanda, Kickboxing, Muay Thai, etc.
export interface Discipline {
  id:          string;
  name:        string;   // e.g. "Sanda"
  slug:        string;   // e.g. "sanda" — for URL / lookup use
  order:       number;   // controls display order in the discipline grid, admin-set
  description?: string;
  createdAt:   string;
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
  program:                 Program; // "wushu" | "fitness" — existing members default to "wushu"
  registrationType:        RegistrationType;
  previousBelt?:           string; // free-text, self-reported at registration (existing only)
  yearJoined?:             string; // self-reported, may not match createdAt
  adminNotes:              AdminNote[];
  nameCorrectionRequest:   NameCorrectionRequest | null;
  createdAt:               string;
}

export interface Tutorial {
  id:              string;
  // Exactly one of beltId / disciplineId is set per tutorial — beltId for
  // Wushu content (progression-based), disciplineId for Sanda content
  // (Sanda, Kickboxing, Conditioning, etc. — no progression order).
  beltId?:         string; // -> Belt.id, Wushu tutorials only
  disciplineId?:   string; // -> Discipline.id, Sanda tutorials only
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

// Add this type near ClassType:
export type ClassTag = "kids" | "adult" | "kiremt"

// Update the ClassSchedule interface to include the new optional field:
export interface ClassSchedule {
  id:          string;
  day:         string;
  time:        string;      // start time
  endTime:     string;      // end time
  title:       string;
  type:        ClassType;
  location:    string;
  level?:      string;
  instructor?: string;
  tag?:        ClassTag;
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
