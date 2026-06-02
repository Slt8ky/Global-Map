import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const DMSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Map",
  description: "See other friend's on the map",
  authors: [{ name: 'slt8ky' }],
  keywords: ['global map', 'map'],
  icons: 'icon.png'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${DMSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
