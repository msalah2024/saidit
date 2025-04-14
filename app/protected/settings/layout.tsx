import SettingsHeader from "@/components/SettingsHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center mt-8">
            <SettingsHeader />
            {children}
        </div>
    );

}