import { redirect } from "next/navigation";
import Profile from "@/src/components/members/Profile";
import { getCurrentUserProfile } from "@/src/lib/get-profile";
import { getBelts } from "@/src/lib/belts";

export default async function ProfilePage() {
  const [user, belts] = await Promise.all([
    getCurrentUserProfile(),
    getBelts(),
  ]);

  if (!user) {
    redirect("/auth/login?redirectTo=/profile");
  }

  return <Profile user={user} belts={belts} />;
}