"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import PublicationsNavbar from "@/_components/PublicationsNavbar";
import BackToTop from "@/_components/BackToTop";

export default function PublicationsLayout({ children }) {
  const pathname = usePathname();

  // Pages sans navbar
  const authPages = ["/publications/connexion", "/publications/inscription"];
  const hideNavbar = authPages.includes(pathname);

  return (
    <SessionProvider>
      {!hideNavbar && <PublicationsNavbar />}
      {children}
      {!hideNavbar && <BackToTop />}
    </SessionProvider>
  );
}
