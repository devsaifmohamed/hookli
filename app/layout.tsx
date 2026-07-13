import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SITE_URL, TAGLINE } from "@/lib/site";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/* Brand v3 sans (Avenir-class geometric). Served from the @fontsource package so
   the build never needs a Google Fonts download — same reasoning as lib/og.tsx. */
const plusJakarta = localFont({
  variable: "--font-plus-jakarta",
  src: [
    {
      path: "../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
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
  themeColor: "#04191f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ground font-sans text-fg">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
