"use client"
import RecentlyVisitedPostsList from "@/components/RecentlyVisitedPostsList";
import Logo from "@/public/assets/images/saidit-logo.svg";
import Image from "next/image";
import { useGeneralProfile } from "./context/GeneralProfileContext";
export default function Home() {
  const { profile } = useGeneralProfile()
  return (
    <div className="flex justify-center">
      <div className="flex justify-center items-center w-full lg:w-[50%] h-[calc(100vh-56px)]">
        <Image src={Logo} alt="Logo" width={150} height={150} draggable={false} className="select-none" />
      </div>
      {
        profile?.recently_visited_posts && profile?.recently_visited_posts.length > 0 &&
        <RecentlyVisitedPostsList />
      }
    </div>
  );
}
