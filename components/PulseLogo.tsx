import React, { memo } from 'react'
import Image from 'next/image'
import logo from '@/public/assets/images/saidit-logo.svg'
interface PulseLogoProps {
    size?: number
    className?: string
}


export default memo(function PulseLogo({ size = 60, className = "" }: PulseLogoProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 animate-ping">
                    <div
                        className="w-full h-full rounded-full bg-[#59AE4A] opacity-20"
                        style={{ width: size * 1.0, height: size * 1.0, marginLeft: size * 0.0, marginTop: size * 0.0 }}
                    />
                </div>
                <div className="relative animate-pulse">
                    <Image src={logo} alt="Logo" width={size} height={size} className="drop-shadow-lg" />
                </div>
            </div>
        </div>
    )
})
