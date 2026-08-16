import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "CFA wizard // System Architecture '26 — CFA Level 1 Engine",
  description: "Institutional-grade diagnostic engine, interactive 2-question vignette sets, Texas Instruments BA II Plus keystrokes, and Distractor Autopsies for CFA Level 1 candidates.",
  keywords: ["CFA Level 1", "CFA wizard", "TI BA II Plus", "Distractor Autopsy", "Finance", "Fixed Income", "Ethical Standards", "Formula Matrix"],
  authors: [{ name: "CFA wizard" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090B] text-white antialiased selection:bg-brand-lime selection:text-black">
        {children}
      </body>
    </html>
  );
}
