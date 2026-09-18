import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased selection:bg-brand-lime selection:text-black">
        {children}
      </body>
    </html>
  );
}
