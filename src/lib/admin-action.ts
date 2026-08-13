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