import AdminMembers from "@/src/components/admin/AdminMembers";
import { getAllMembers, getCallerRole, getAllAdmins } from "@/src/lib/get-all-members";
import { getBelts } from "@/src/lib/belts";

export default async function AdminMembersPage() {
  const [members, belts, callerRole] = await Promise.all([
    getAllMembers(),
    getBelts(),
    getCallerRole(),
  ]);
  const admins = callerRole === "super_admin" ? await getAllAdmins() : [];
  return (
    <AdminMembers
      initialMembers={members}
      belts={belts}
      callerRole={callerRole}
      initialAdmins={admins}
    />
  );
}