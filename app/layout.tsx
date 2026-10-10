import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalChrome from "@/src/components/layout/ConditionalChrome";
import PwaRegister from "@/src/components/pwa/PwaRegister";

export const metadata: Metadata = {
  title: "EagleGlow",
  description: "Refine the Body. Discipline the Mind. Master the Art of Wushu.",
  keywords: ["Wushu", "Martial Arts", "Fitness", "EagleGlow"],
  applicationName: "EagleGlow",
  appleWebApp: {
    capable: true,
    title: "EagleGlow",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
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
        <PwaRegister />
        
      </body>
    </html>
  );
}