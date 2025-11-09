import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from '../components/Header'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Networking Platform",
  description: "Plataforma de gerenciamento de networking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <Header />
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
