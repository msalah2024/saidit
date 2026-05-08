"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
    const pathname = usePathname()
    const prevPathname = useRef(pathname)

    useEffect(() => {
        history.scrollRestoration = "manual"
    }, [])

    useEffect(() => {
        const prev = prevPathname.current
        prevPathname.current = pathname

        // Skip when opening or closing a post modal so the feed keeps its position
        if (pathname.includes("/comments/") || prev.includes("/comments/")) return

        const id = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0)
        return () => clearTimeout(id)
    }, [pathname])

    return null
}
