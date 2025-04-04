import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
// import { ThemeProvider } from "@/app/components/theme-provider"
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner"
import { createClient } from '@/utils/supabase/server'

const robotoSlap = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "saidit",
  description: "An open-source Reddit alternative",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select("username, avatar_url").eq("email", user?.email).single()

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={robotoSlap.className} suppressHydrationWarning>
          <Navbar user={user} profile={profile} />
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    </>
  );
}
