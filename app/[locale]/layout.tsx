import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";
import BottomNav from "@/components/BottomNav";
import { Providers } from "../providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recipe AI",
  description: "Your magic recipe generator and cooking assistant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Recipe AI",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icon-192x192.png",
  },
};

import { getDictionary } from "@/i18n/dictionaries";
import { DictionaryProvider } from "@/components/DictionaryProvider";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <DictionaryProvider dictionary={dictionary}>
            {children}
            <BottomNav />
          </DictionaryProvider>
        </Providers>
      </body>
    </html>
  );
}
