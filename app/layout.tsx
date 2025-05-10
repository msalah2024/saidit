import type { Metadata } from "next";
import { Roboto_Slab, Inter } from "next/font/google";
import localFont from 'next/font/local'
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner"
import { createClient } from '@/utils/supabase/server'
import NextTopLoader from 'nextjs-toploader';

const robotoSlap = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoSlapLocal = localFont({
  src: './fonts/RobotoSlab-VariableFont_wght.ttf',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Saidit",
  description: "An open-source Reddit alternative",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select("username, avatar_url").eq("account_id", user?.id).single()

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${robotoSlap.className} ${robotoSlapLocal.className} ${inter.className}`} suppressHydrationWarning>
          <NextTopLoader
            color="#5BAE4A"
            showSpinner={false}
            easing="ease"
          />
          <Navbar user={user} profile={profile} />
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    </>
  );
}
