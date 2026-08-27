import { getUserProfile } from "@/actions/user";
import { isError } from "@/_libs/errors";
import { redirect } from "next/navigation";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const profile = await getUserProfile();
  if (!profile || isError(profile)) redirect("/publications/connexion");
  return <ProfilClient initialProfile={profile} />;
}
