import "./styles/main.scss";
import NavbarSwitcher from "./_components/NavbarSwitcher";
import BackToTop from "./_components/BackToTop";
import Footer from "./_components/footer";
import PartnershipBanner from "./_components/PartnershipBanner";

export const metadata = {
  metadataBase: new URL("https://sinese.fr"),
  title: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
  description:
    "Le portail SINESE répertorie les données relatives à l'empreinte sociétale des entreprises en France. Il permet de consulter en toute transparence les performances extra-financières des entreprises afin d'identifier celles dont les activités sont alignées avec les objectifs et plans nationaux sur les enjeux clés de durabilité.",
  keywords: [
    "SINESE",
    "Empreinte Sociétale",
    "Entreprises",
    "Système d'Information",
    "Développement Durable",
    "Responsabilité Sociétale des Entreprises",
    "Impact Sociétal",
    "Données Ouvertes",
  ],
  authors: [{ name: "SINESE" }],
  creator: "SINESE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sinese.fr",
    siteName: "SINESE",
    title: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
    description:
      "Le portail SINESE répertorie les données relatives à l'empreinte sociétale des entreprises en France. Il permet de consulter en toute transparence les performances extra-financières des entreprises afin d'identifier celles dont les activités sont alignées avec les objectifs et plans nationaux sur les enjeux clés de durabilité.",
    images: [
      {
        url: "/images/og-image-sinese.jpg",
        width: 1200,
        height: 630,
        alt: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
        type: "image/jpeg",
      },
    ],
  },
  alternates: {
    canonical: "https://sinese.fr",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>

        <NavbarSwitcher />
        <PartnershipBanner />
        <main className="main-content flex-grow-1">
          {children}
        </main>
        <BackToTop />
        <Footer />
      </body>
    </html>
  );
}
