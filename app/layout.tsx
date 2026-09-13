import type { Metadata } from "next";
import { Cinzel, DM_Mono, Fauna_One } from "next/font/google";
import "./globals.css";
import "./design-overrides.css";
import { ThemeProvider } from "@/components/Theme/ThemeContext";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import PublicAtmosphere, { PublicContent } from "@/components/Layout/PublicAtmosphere";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const faunaOne = Fauna_One({ subsets: ["latin"], weight: "400", variable: "--font-fauna" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DC Organizer — Wedding & Digital Invitation",
  description: "DC Organizer — platform terpadu untuk undangan digital, RSVP, dan pengelolaan tamu pernikahan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${cinzel.variable} ${faunaOne.variable} ${dmMono.variable} antialiased min-h-screen flex flex-col justify-between overflow-x-hidden`}>
        <ThemeProvider>
          <PublicAtmosphere />
          <Navbar />
          <PublicContent>{children}</PublicContent>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
