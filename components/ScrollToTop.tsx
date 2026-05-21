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

        // Track in-app navigation so PostBackButton knows whether to go back or home
        sessionStorage.setItem("saidit_prev_path", prev)

        // Skip when opening or closing a post modal so the feed keeps its position
        if (pathname.includes("/comments/") || prev.includes("/comments/")) return

        const id = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0)
        return () => clearTimeout(id)
    }, [pathname])

    return null
}
