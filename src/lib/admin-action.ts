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