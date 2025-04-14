"use client"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

export function NavigationProgress() {
  const [progress, setProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleStart = () => {
      setIsAnimating(true)
      setProgress(10)
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer)
            return prev
          }
          return prev + 10
        })
      }, 100)
    }

    const handleRouteChange = () => {
      handleStart()
    }

    handleRouteChange()

    return () => {
      clearInterval(timer)
    }
  }, [pathname]) 

  useEffect(() => {
    if (progress > 0) {
      const timer = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsAnimating(false)
          setProgress(0)
        }, 200)
      }, 500) 

      return () => clearTimeout(timer)
    }
  }, [pathname, progress])

  if (!isAnimating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
      <Progress value={progress} className="h-0.5 rounded-none" />
    </div>
  )
}