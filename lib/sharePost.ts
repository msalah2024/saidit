import { toast } from "sonner"

export async function sharePost(communityName: string, slug: string) {
    const url = `${window.location.origin}/s/${communityName}/comments/${slug}`

    if (!navigator.clipboard) {
        // Fallback for older browsers
        const textarea = document.createElement("textarea")
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
    } else {
        try {
            await navigator.clipboard.writeText(url)
        } catch (err) {
            console.error("Failed to copy: ", err)
            return
        }
    }

    toast.success("Link copied!")
}
