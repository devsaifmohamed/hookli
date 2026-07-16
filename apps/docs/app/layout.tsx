import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DonateButton } from "@/components/donate-button";
import { SITE_URL, TAGLINE } from "@/lib/site";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/* Premium UI/body face: Geist — Vercel's typeface, purpose-built for developer
   products. Professional and precise (replaces the friendlier Plus Jakarta).
   Code stays on JetBrains Mono. */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "hookli — %s",
    default: "hookli — simple React hooks",
  },
  description: TAGLINE,
  openGraph: {
    type: "website",
    siteName: "hookli",
    url: "/",
    title: {
      template: "hookli — %s",
      default: "hookli — simple React hooks",
    },
    description: TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/hookli-icon.svg",
  },
};

export const viewport: Viewport = {
  // Mobile browser chrome — matches --color-ground (globals.css). A theme-color
  // meta tag requires a literal hex; keep this in sync with the ground token.
  themeColor: "#16181d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ground font-sans text-fg">
        <Header />
        {children}
        <Footer />
        <DonateButton />
      </body>
    </html>
  );
}
