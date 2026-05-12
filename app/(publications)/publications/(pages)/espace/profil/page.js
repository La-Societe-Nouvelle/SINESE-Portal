import { getUserProfile } from "@/actions/user";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const profile = await getUserProfile();
  return <ProfilClient initialProfile={profile} />;
}
