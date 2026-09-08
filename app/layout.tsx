import type { Metadata } from "next";
import { Cinzel, Fauna_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme/ThemeContext";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import PublicAtmosphere, { PublicContent } from "@/components/Layout/PublicAtmosphere";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const faunaOne = Fauna_One({ subsets: ["latin"], weight: "400", variable: "--font-fauna" });

export const metadata: Metadata = {
  title: "DC - Wedding & Digital Invitation",
  description: "Layanan Wedding Organizer & Undangan Digital Premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${cinzel.variable} ${faunaOne.variable} antialiased min-h-screen flex flex-col justify-between overflow-x-hidden`}>
        <ThemeProvider>
          <PublicAtmosphere />
          <Navbar />
          
          <PublicContent>
            {children}
          </PublicContent>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}