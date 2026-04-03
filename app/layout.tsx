import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://culirated.com"),
  title: {
    default: "Culirated — AI-Generated Recipes, Quality-Checked Daily",
    template: "%s — Culirated",
  },
  description:
    "Every day, AI generates 8 fresh recipes — trending-driven, quality-checked, available in 20+ languages. Cook one, rate it, and join the community.",
  keywords: [
    "AI recipes", "artificial intelligence cooking", "recipe generator",
    "daily recipes", "multilingual recipes", "trending recipes",
    "quality checked recipes", "community recipes",
  ],
  authors: [{ name: "Culirated", url: "https://culirated.com" }],
  creator: "Culirated",
  publisher: "Culirated",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Culirated",
    title: "Culirated — AI-Generated Recipes, Quality-Checked Daily",
    description:
      "Every day, AI generates 8 fresh recipes — trending-driven, quality-checked, available in 20+ languages. Cook one, rate it, and join the community.",
    url: "https://culirated.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Culirated — AI-Generated Recipes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Culirated — AI-Generated Recipes, Quality-Checked Daily",
    description:
      "Every day, AI generates 8 fresh recipes — trending-driven, quality-checked, available in 20+ languages.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://culirated.com",
  },
  verification: {
    google: undefined, // Voeg hier je Google Search Console verificatiecode toe als je die hebt
  },
  category: "food",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// WebSite + Organization schema voor Google
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Culirated",
  url: "https://culirated.com",
  description:
    "AI-generated recipes, quality-checked daily. Available in 20+ languages.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://culirated.com/recipes?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Culirated",
  url: "https://culirated.com",
  logo: "https://culirated.com/logo.png",
  description:
    "AI-generated recipe platform. Every day, AI creates fresh recipes trending-driven and quality-checked.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "culirated@gmail.com",
    contactType: "customer support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BGXMF4HS8K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BGXMF4HS8K');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
