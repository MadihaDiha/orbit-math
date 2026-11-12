import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getProfileData } from "@/lib/data";
import { ProfileView } from "@/components/views/ProfileView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) return <DemoPage view="profile" />;
  return <ProfileView data={await getProfileData()} />;
}
