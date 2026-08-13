import AdminMembers from "@/src/components/admin/AdminMembers";
import { getAllMembers } from "@/src/lib/get-all-members";
import { getBelts } from "@/src/lib/belts";

export default async function AdminMembersPage() {
  const [members, belts] = await Promise.all([getAllMembers(), getBelts()]);
  return <AdminMembers initialMembers={members} belts={belts} />;
}