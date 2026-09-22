import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cinzel, DM_Mono, Fauna_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { LanguageProvider } from "@/components/I18n/LanguageProvider";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import PortalTransition from "@/components/Landing/Pintu/PortalTransition";
import PublicAtmosphere, { PublicContent } from "@/components/Layout/PublicAtmosphere";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const faunaOne = Fauna_One({ subsets: ["latin"], weight: "400", variable: "--font-fauna" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DC Organizer — Wedding & Digital Invitation",
  description: "DC Organizer — integrated wedding planning, digital invitations, RSVP, and guest management.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(savedLocale) ? savedLocale : "id";

  return (
    <html lang={locale} className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${cinzel.variable} ${faunaOne.variable} ${dmMono.variable} antialiased min-h-screen flex flex-col justify-between overflow-x-hidden`}>
        <LanguageProvider initialLocale={locale}>
          <ThemeProvider>
            <PortalTransition />
            <PublicAtmosphere />
            <Navbar />
            <PublicContent>{children}</PublicContent>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
