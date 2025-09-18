import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import {NextIntlClientProvider} from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Toaster } from "@/components/ui/sonner"
import { Footer } from "@/components/footer";
import { QueryProvider } from "@/lib/query-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Food Locator - Discover Amazing Local Restaurants",
    template: "%s | Food Locator"
  },
  description: "Discover the best local restaurants, authentic cuisines, and hidden culinary gems in your area. Find restaurants by dietary preferences, price range, and authentic atmosphere.",
  keywords: ["restaurants", "food", "local dining", "cuisine", "restaurant finder", "food discovery", "dining", "authentic food"],
  authors: [{ name: "Food Locator Team" }],
  creator: "Food Locator",
  publisher: "Food Locator",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://food-locator.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'nl': '/nl',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Food Locator - Discover Amazing Local Restaurants',
    description: 'Discover the best local restaurants, authentic cuisines, and hidden culinary gems in your area.',
    siteName: 'Food Locator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Food Locator - Discover Amazing Local Restaurants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Locator - Discover Amazing Local Restaurants',
    description: 'Discover the best local restaurants, authentic cuisines, and hidden culinary gems in your area.',
    creator: '@foodlocator',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'facebook-domain-verification': 'your-facebook-verification-code',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Navbar />
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
          <Footer />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
