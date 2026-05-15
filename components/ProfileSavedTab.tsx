"use client"
import { Bookmark } from "lucide-react"

export default function ProfileSavedTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border-t text-muted-foreground gap-3">
      <Bookmark className="h-10 w-10" />
      <p className="text-lg font-medium">No saved posts</p>
      <p className="text-sm">Posts you save will appear here</p>
    </div>
  )
}
