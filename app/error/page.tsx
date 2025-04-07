import Image from "next/image"
import errorImage from "@/public/assets/images/error-page-image.svg"
export default function ErrorPage() {
    return <div className="flex flex-col justify-center items-center gap-2 h-[calc(100vh-56px)]">
        <Image src={errorImage} alt="Error" width={100} height={100} draggable={false} className="select-none" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Sorry, something went wrong.
        </h3>
    </div>
}