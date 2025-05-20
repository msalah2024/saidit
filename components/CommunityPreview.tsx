import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { memo } from "react"
import { getBreakClass } from "@/lib/textUtils"

interface CommunityPreviewProps {
    name: string
    description?: string
    type: "public" | "restricted" | "private"
    topics?: string[]
    globalAvatar: string | null
    globalBanner: string | null
}

const CommunityPreview = ({
    name = "YourCommunity",
    description = "Your community description will appear here...",
    type = "public",
    topics = [],
    globalAvatar,
    globalBanner
}: CommunityPreviewProps) => {

    const nameBreakClass = getBreakClass(name)
    const descriptionBreakClass = getBreakClass(description)

    return (
        <Card className="px-4 gap-0">
            <h3 className="mb-4 font-medium">Community preview</h3>
            <CardContent className="p-0">
                <div className="overflow-hidden rounded-md">
                    <div
                        className={`h-24 bg-cover bg-center bg-no-repeat bg-gradient-to-r ${!globalBanner && "from-[oklch(67.59%_0.1591_140.34)] to-[oklch(55%_0.17_230)]"}`}
                        style={globalBanner ? { backgroundImage: `url(${globalBanner})` } : undefined}
                    ></div>
                    <div className="relative bg-background p-4">
                        <div className="absolute -top-6 left-4 overflow-hidden rounded-full border-4 border-background bg-muted">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={globalAvatar || undefined} />
                                <AvatarFallback>s/</AvatarFallback>
                            </Avatar>

                        </div>
                        <div className="ml-14 pt-1">
                            <h4 className={`font-semibold ${nameBreakClass}`}>s/{name || "YourCommunity"}</h4>
                            <p className={`text-xs text-muted-foreground ${nameBreakClass}`}>
                                s/{name || "YourCommunity"} • 1 member • Created just now
                            </p>
                        </div>
                        <div className="mt-3 text-sm">
                            <p className={`line-clamp-2 text-muted-foreground ${descriptionBreakClass}`}>
                                {description || "Your community description will appear here..."}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground">
                            <Users className="mr-1 h-3 w-3" />
                            <span>{type === "public" ? "Public" : type === "restricted" ? "Restricted" : "Private"} community</span>
                        </div>
                        {topics.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {topics.map((topic) => (
                                    <span key={topic} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
export default memo(CommunityPreview)