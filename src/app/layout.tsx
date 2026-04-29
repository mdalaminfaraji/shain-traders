import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shahin Traders | Inventory Management",
  description: "Modern inventory and customer ledger system",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {/* Mobile Top Bar */}
          <div className="h-16 lg:hidden border-b border-border bg-background/80 backdrop-blur-md fixed top-0 w-full z-40 no-print flex items-center px-4">
            <span className="ml-12 font-bold tracking-tight text-xs uppercase opacity-70">Shahin Traders</span>
          </div>
          <div className="h-16 lg:hidden no-print" />
          
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
