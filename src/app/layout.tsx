import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShoppingCart, Users, Package } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Melkstroom Tuckshop",
  description: "Point of Sale Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 print:hidden">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4">
              <div className="flex gap-6 md:gap-10">
                <Link href="/" className="flex items-center space-x-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="inline-block font-bold">Melkstroom Tuckshop</span>
                </Link>
                <nav className="flex gap-6">
                  <Link
                    href="/"
                    className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    POS
                  </Link>
                  <Link
                    href="/users"
                    className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Users
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Products
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1 container py-6 px-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
