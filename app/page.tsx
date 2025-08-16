import RecentlyVisitedPostsList from "@/components/RecentlyVisitedPostsList";
import Logo from "@/public/assets/images/saidit-logo.svg";
import Image from "next/image";
export default function Home() {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center items-center w-full lg:w-[50%] h-[calc(100vh-56px)]">
        <Image src={Logo} alt="Logo" width={150} height={150} draggable={false} className="select-none" />
      </div>
      <div className="bg-black rounded-sm hidden lg:flex h-fit mt-10">
        <RecentlyVisitedPostsList />
      </div>
    </div>
  );
}
