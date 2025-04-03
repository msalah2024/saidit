import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
// import { ThemeProvider } from "@/app/components/theme-provider"
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const robotoSlap = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "saidit",
  description: "An open-source Reddit alternative",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={robotoSlap.className} suppressHydrationWarning>
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    </>
  );
}
