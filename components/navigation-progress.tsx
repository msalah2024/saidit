'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

export default function TopProgressBar() {
  const pathname = usePathname()
  const [value, setValue] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!pathname) return

    let currentProgress = 1
    setValue(currentProgress)
    setVisible(true)
    setFadeOut(false)

    const interval = setInterval(() => {
      // Trickling effect, goes slower the closer it gets to 95%
      const delta = Math.max(0.5, (95 - currentProgress) * 0.03)
      currentProgress = Math.min(currentProgress + delta, 95)
      setValue(currentProgress)
    }, 80)

    const finish = () => {
      clearInterval(interval)
      setValue(100)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          setVisible(false)
          setFadeOut(false)
          setValue(0)
        }, 300)
      }, 300)
    }

    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish)
    }

    return () => {
      clearInterval(interval)
      window.removeEventListener('load', finish)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
    >
      <Progress
        value={value}
        className="h-0.5 rounded-none [&>div]:bg-primary"
      />
    </div>
  )
}

