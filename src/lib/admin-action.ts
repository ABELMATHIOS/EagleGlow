// Call from AdminMembers.tsx's "Approve" button. Throws on failure so the
// caller can show an error toast/message.
export async function approveUser(userId: string) {
  const res = await fetch(`/api/admin/users/${userId}/approve`, {
    method: "POST",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to approve user");
  }

  return res.json();
}

// Call from AdminMembers.tsx's "Promote Belt" confirm button. Throws on
// failure so the caller can show an error toast/message.
export async function promoteBelt(userId: string, beltId: string) {
  const res = await fetch(`/api/admin/users/${userId}/belt`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beltId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update belt");
  }

  return res.json();
}
// Call from AdminMembers.tsx's "Reset Password" button. Sets the
// member's password directly via the Supabase admin API — no email is
// sent, so this doesn't touch the 2/hour SMTP rate limit. Throws on
// failure so the caller can show an error toast/message.
export async function resetMemberPassword(userId: string, newPassword: string) {
  const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to reset password");
  }

  return res.json();
}

// Call from AdminMembers.tsx's Decline / Suspend / Reactivate / Mark
// Serving buttons. Throws on failure so the caller can show an error
// toast/message.
import type { Status } from "@/src/types";

// Call from AdminMembers.tsx's Decline / Suspend / Reactivate / Mark
// Serving / Withdraw / End Service buttons. `previousStatus` is optional —
// pass it on Reactivate so the API route can restore the member's status
// from before they were paused, instead of always resetting to 'active'.
// Throws on failure so the caller can show an error toast/message.
export async function updateMemberStatus(userId: string, status: Status, previousStatus?: Status) {
  const res = await fetch(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, previousStatus }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update status");
  }

  return res.json();
}
export async function createAlbum(album: Record<string, unknown>) {
  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(album),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create album");
  }
  return res.json();
}

export async function updateAlbum(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`/api/admin/gallery/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update album");
  }
  return res.json();
}

export async function deleteAlbum(id: string) {
  const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete album");
  }
  return res.json();
}
export async function createTutorial(tutorial: Record<string, unknown>) {
  const res = await fetch("/api/admin/tutorials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tutorial),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create tutorial");
  }
  return res.json();
}

export async function updateTutorial(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`/api/admin/tutorials/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update tutorial");
  }
  return res.json();
}

export async function deleteTutorial(id: string) {
  const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete tutorial");
  }
  return res.json();
}
export async function createClass(classItem: Record<string, unknown>) {
  const res = await fetch("/api/admin/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(classItem),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create class");
  }
  return res.json();
}

export async function updateClass(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`/api/admin/classes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update class");
  }
  return res.json();
}

export async function deleteClass(id: string) {
  const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete class");
  }
  return res.json();
}
// Call from AdminMembers.tsx's Approve/Reject buttons on a pending name
// correction request. Throws on failure so the caller can show an error.
export async function reviewNameCorrection(userId: string, action: "approve" | "reject") {
  const res = await fetch(`/api/admin/users/${userId}/name-correction`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to review name correction");
  }

  return res.json();
}
// Add to src/lib/admin-action.ts, alongside approveUser / promoteBelt /
// updateMemberStatus / reviewNameCorrection — same fetch-and-throw pattern.

import { AboutContent } from '@/src/types'; // add AboutContent + Certificate to src/types.ts, see about-types_addition.ts

export async function updateAboutContent(patch: Partial<AboutContent>): Promise<AboutContent> {
  const res = await fetch('/api/admin/about', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to update About Us content');
  }
  return res.json();
}
export async function updateHomeContent(patch: { heroVideoUrl?: string | null }) {
  const res = await fetch('/api/admin/home', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to update Home content');
  }
  return res.json();
}
export async function addMemberNote(userId: string, note: string) {
  const res = await fetch(`/api/admin/users/${userId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to add note");
  }
  return res.json();
}

export async function deleteMemberNote(userId: string, noteId: string) {
  const res = await fetch(`/api/admin/users/${userId}/notes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete note");
  }
  return res.json();
}
export async function setMemberAdminRole(userId: string, grant: boolean) {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update admin access");
  }
  return res.json();
}