"use client";

import { usePathname } from "next/navigation";
import PortalNavbar from "./PortalNavbar";

export default function NavbarSwitcher() {
  const pathname = usePathname();

  // Masquer la navbar du portail quand on est dans /publications
  // (PublicationsLayout affichera sa propre navbar)
  if (pathname.startsWith("/publications")) {
    return null;
  }

  return <PortalNavbar />;
}
