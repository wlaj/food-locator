import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const boldonse = localFont({
  src: [
    {
      path: "../../public/fonts/Boldonse-Regular.ttf",
      weight: "400",
    },
  ],
  variable: "--font-boldonse",
});

export const metadata: Metadata = {
  title: "Fastchaps",
  description:
    "Find the best restaurants in Amsterdam based on your preferences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${boldonse.variable} antialiased`}>
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
