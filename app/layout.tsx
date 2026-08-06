import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";

export const metadata: Metadata = {
  title: "EagleGlow | Wushu & Fitness Center",
  description: "Refine the Body. Discipline the Mind. Master the Art of Wushu.",
  keywords: ["Wushu", "Martial Arts", "Fitness", "EagleGlow"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0d0d] min-h-screen">
        <Navbar />
        <main className="pt-[68px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}