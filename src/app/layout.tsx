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
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0 no-print">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold tracking-tight">SHAHIN TRADERS</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="block p-2 rounded hover:bg-white/5 transition-colors">Dashboard</Link>
            <Link href="/inventory" className="block p-2 rounded hover:bg-white/5 transition-colors">Inventory</Link>
            <Link href="/customers" className="block p-2 rounded hover:bg-white/5 transition-colors">Customers</Link>
            <Link href="/reports/dues" className="block p-2 rounded hover:bg-white/5 transition-colors text-red-400/80 hover:text-red-400">Dues Report</Link>
            <Link href="/sales/new" className="block p-2 rounded hover:bg-white/5 transition-colors">New Sale</Link>
            <Link href="/payments/new" className="block p-2 rounded hover:bg-white/5 transition-colors">Record Payment</Link>
          </nav>
          <div className="p-4 border-t border-border text-xs text-muted">
            v1.0.0
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
