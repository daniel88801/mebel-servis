import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RequestModalProvider } from "@/components/RequestModal";
import { CartProvider } from "@/components/CartProvider";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/JsonLd";
import { CallbackWidget } from "@/components/CallbackWidget";
import { CookieNotice } from "@/components/CookieNotice";
import { Metrika } from "@/components/Metrika";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * Одна гарнитура на весь сайт. Заголовки отличаются только весом и трекингом:
 * так набор читается ровно, без скачка рисунка между крупным и мелким.
 */
const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Мебель-Сервис — производство мебели для объектов, Нижний Новгород",
    template: "%s — Мебель-Сервис",
  },
  description:
    "ООО «Мебель-Сервис»: армейская мебель, металлические кровати, мебель на металлокаркасе и ЛДСП. Собственное производство более 4 000 м² в Нижнем Новгороде.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Мебель-Сервис",
    title: "Мебель-Сервис — производство мебели для объектов",
    description:
      "Армейская мебель, металлические кровати, металлокаркас и ЛДСП. Серийные поставки из Нижнего Новгорода.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#161814" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <RequestModalProvider>
          <CartProvider>
            <a className="skip" href="#content">
              К содержанию
            </a>
            <Header />
            {children}
            <Footer />
            <CallbackWidget />
            <CookieNotice />
          </CartProvider>
        </RequestModalProvider>
        <Metrika />
      </body>
    </html>
  );
}
