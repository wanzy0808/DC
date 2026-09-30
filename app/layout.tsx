import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { DM_Mono, DM_Serif_Display, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { LanguageProvider } from "@/components/I18n/LanguageProvider";
import { isLocale, LEGACY_LOCALE_COOKIE, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import PortalTransition from "@/components/Landing/Pintu/PortalTransition";
import PublicAtmosphere, { PublicContent } from "@/components/Layout/PublicAtmosphere";
import { MarketingAudioProvider } from "@/components/Layout/MarketingAudio";
import MarketingFloatingControls from "@/components/Layout/MarketingFloatingControls";
import MarketingDoorNavigator from "@/components/Layout/MarketingDoorNavigator";
import AuthDialogHost from "@/components/Auth/AuthDialogHost";
import ThreeConsoleBridge from "@/components/Three/ThreeConsoleBridge";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-undara-display",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-undara-body",
});
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-undara-technical" });

export const metadata: Metadata = {
  title: "Undara — Undangan & Acara",
  description: "Undara adalah platform undangan digital dan operasional acara untuk publikasi, RSVP, manajemen tamu, dan kebutuhan event.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get(LOCALE_COOKIE)?.value ?? cookieStore.get(LEGACY_LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(savedLocale) ? savedLocale : "id";
  const savedTheme = cookieStore.get("theme")?.value;
  const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : undefined;

  return (
    <html
      lang={locale}
      className={initialTheme === "dark" ? "dark scroll-smooth" : "scroll-smooth"}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className={`${dmSerifDisplay.variable} ${roboto.variable} ${dmMono.variable} antialiased min-h-screen flex flex-col justify-between overflow-x-hidden`}>
        <LanguageProvider initialLocale={locale}>
          <ThemeProvider initialTheme={initialTheme}>
            <MarketingAudioProvider>
              <ThreeConsoleBridge />
              <PortalTransition />
              <PublicAtmosphere />
              <Navbar />
              <PublicContent>{children}</PublicContent>
              <Footer />
              <MarketingFloatingControls />
              <MarketingDoorNavigator />
              <Suspense fallback={null}><AuthDialogHost /></Suspense>
            </MarketingAudioProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
