import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CFA Wizard | Level I Study Practice",
  description: "Clear CFA Level I study practice, explanations, calculator workflows, and progress review for self-directed candidates.",
  keywords: ["CFA Level I", "CFA Wizard", "CFA study", "BA II Plus", "practice questions"],
  authors: [{ name: "CFA wizard" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-brand-lime selection:text-black">
        {children}
      </body>
    </html>
  );
}
