export type Role      = "guest" | "member" | "admin";
export type Status    = "pending" | "active" | "graduated" | "serving" | "paused" | "withdrawn";
export type MediaType = "photo" | "video";
export type RegistrationType = "new" | "training" | "returning";

export interface User {
  id:                       string;
  name:                     string;
  email:                    string;
  phone?:                   string;
  emergency_contact_name?:  string;
  emergency_contact_phone?: string;
  photo_url?:               string;
  belt_id?:                 string;
  role:                     Role;
  status:                   Status;
  created_at:               string;
}

export interface MembershipHistory {
  id:         string;
  user_id:    string;
  status:     Status;
  changed_at: string;
  reason?:    string;
  changed_by: string; // admin id, "self-registration", or "migrated from paper records"
}

export interface Belt {
  id:          string;
  name:        string;
  color:       string;
  order:       number;
  description: string;
}

export interface Tutorial {
  id:          string;
  belt_id:     string;
  title:       string;
  description: string;
  video_url:   string;
  duration:    number;
  order:       number;
  created_at:  string;
}

export interface ClassSchedule {
  id:         string;
  title:      string;
  day:        string;
  time:       string;
  level:      string;
  instructor: string;
  duration:   number;
}

export interface GalleryItem {
  id:          string;
  media_url:   string;
  type:        MediaType;
  caption:     string;
  uploaded_at: string;
}