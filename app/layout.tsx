import type { Metadata } from "next";
import { Roboto_Slab, Inter } from "next/font/google";
import localFont from 'next/font/local'
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner"
import { createClient } from '@/utils/supabase/server'
import NextTopLoader from 'nextjs-toploader';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GeneralProfileProvider } from "./context/GeneralProfileContext";
import { cookies } from "next/headers";
import { ViewProvider } from "./context/ViewContext";

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
  const { data: profile } = await supabase.from('users').select('*, community_memberships(*, communities(*))').eq('account_id', user?.id).single()

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"


  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${robotoSlap.className} ${robotoSlapLocal.className} ${inter.className}`} suppressHydrationWarning>
          <NextTopLoader
            color="#5BAE4A"
            showSpinner={false}
            easing="ease"
          />
          <SidebarProvider defaultOpen={defaultOpen}>
            <Navbar user={user} profile={profile} />
            <div className="flex w-full">
              <GeneralProfileProvider value={{ user, profile }}>
                <ViewProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <div className="w-full mt-14">
                      {children}
                    </div>
                  </SidebarInset>
                </ViewProvider>
              </GeneralProfileProvider>
            </div>
          </SidebarProvider>
          <Toaster position="top-center" />
        </body>
      </html>
    </>
  );
}
