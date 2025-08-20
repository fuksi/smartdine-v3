import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileCartButton } from "@/components/mobile-cart-button";
import { StickyTopBar } from "@/components/sticky-top-bar";
import { CustomerAuthProvider } from "@/lib/auth/CustomerAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartDine - Multi-Restaurant Ordering Platform",
  description: "Order from multiple restaurants for quick pickup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomerAuthProvider>
          <main>{children}</main>
          <MobileCartButton />
          <StickyTopBar />
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
