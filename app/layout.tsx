import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Culirated — Recipes by people, curated by AI",
  description: "Real recipes submitted by home cooks, food bloggers and chefs. Every recipe is verified by AI before going live.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
