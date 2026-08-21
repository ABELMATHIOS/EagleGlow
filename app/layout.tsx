import type { Metadata } from "next";
import "./globals.css";
import ConditionalChrome from "@/src/components/layout/ConditionalChrome";

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
        <ConditionalChrome>{children}</ConditionalChrome>
      </body>
    </html>
  );
}