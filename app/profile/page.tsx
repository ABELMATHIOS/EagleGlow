import { redirect } from "next/navigation";
import Profile from "@/src/components/members/Profile";
import { getCurrentUserProfile } from "@/src/lib/get-profile";

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login?redirectTo=/profile");
  }

  return <Profile user={user} />;
}