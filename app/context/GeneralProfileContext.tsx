'use client'

import { createContext, useContext, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/complexTypes'

interface UserContextType {
    user: User | null
    profile?: Profile | null
}

const UserContext = createContext<UserContextType>({
    user: null,
    profile: null
})

export function GeneralProfileProvider({
    children,
    value
}: {
    children: ReactNode
    value: UserContextType
}) {
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useGeneralProfile = () => useContext(UserContext)
