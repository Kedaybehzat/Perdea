import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Perdea — Zevkini paylaş, ruh eşini bul",
    template: "%s",
  },
  description:
    "Film, dizi ve anime severler için Türkçe sosyal eşleşme ve topluluk platformu. Zevkine göre insanlarla tanış, birlikte keşfet.",
  openGraph: {
    title: "Perdea — Zevkini paylaş, ruh eşini bul",
    description:
      "Film, dizi ve anime severler için Türkçe sosyal eşleşme ve topluluk platformu.",
    type: "website",
    locale: "tr_TR",
    siteName: "Perdea",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Perdea" }],
  },
  twitter: {
    card: "summary",
    title: "Perdea — Zevkini paylaş, ruh eşini bul",
    description:
      "Film, dizi ve anime severler için Türkçe sosyal eşleşme platformu.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}