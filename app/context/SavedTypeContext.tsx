"use client"
import { createContext, useContext, useState } from "react"

type SavedTypeContextValue = {
  savedType: string
  setSavedType: (type: string) => void
}

const SavedTypeContext = createContext<SavedTypeContextValue>({
  savedType: "posts",
  setSavedType: () => {},
})

export function SavedTypeProvider({ children }: { children: React.ReactNode }) {
  const [savedType, setSavedType] = useState("posts")
  return (
    <SavedTypeContext.Provider value={{ savedType, setSavedType }}>
      {children}
    </SavedTypeContext.Provider>
  )
}

export function useSavedType() {
  return useContext(SavedTypeContext)
}
