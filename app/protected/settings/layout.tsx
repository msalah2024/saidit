import SettingsHeader from "@/components/SettingsHeader";
import { createClient } from "@/utils/supabase/server";
import { GeneralProfileProvider } from "@/app/context/GeneralProfileContext";

export default async function Layout({ children }: { children: React.ReactNode }) {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    // console.log(user)
    let profile = null

    if (user?.email) {
        const { data } = await supabase.from('users').select("*").eq("account_id", user?.id).single()
        profile = data
    }

    return (
        <div className="flex items-center flex-col mt-8">
            <GeneralProfileProvider value={{ user, profile }}>
                <div className="max-w-5xl w-full px-4">
                    <SettingsHeader />
                    {children}
                </div>
            </GeneralProfileProvider>
        </div>
    );

}