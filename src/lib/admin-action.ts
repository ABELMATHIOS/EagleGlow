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
// Call from AdminMembers.tsx's Decline / Suspend / Reactivate / Mark
// Serving buttons. Throws on failure so the caller can show an error
// toast/message.
export async function updateMemberStatus(userId: string, status: string) {
  const res = await fetch(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
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