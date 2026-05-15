"use client"
import { EyeOff } from "lucide-react"

export default function ProfileHiddenTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border-t text-muted-foreground gap-3">
      <EyeOff className="h-10 w-10" />
      <p className="text-lg font-medium">No hidden posts</p>
      <p className="text-sm">Posts you hide will appear here</p>
    </div>
  )
}
