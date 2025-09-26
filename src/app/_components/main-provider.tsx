"use client"
import { useHydrateAtoms } from "jotai/utils"
import type { ReactNode } from "react"
import { UAParser } from "ua-parser-js"
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay"
import { useGlobalLoadingState, userAgentAtom } from "@/lib/global-atoms"
import { useClearSelectionOnNavigate } from "@/utils/use-clear-selection-on-navigate"

interface MainProviderProps {
  children: ReactNode
  userAgent: string
}

const MainProvider = ({ children, userAgent }: MainProviderProps) => {
  useClearSelectionOnNavigate()
  const { message, isLoading, hideSpinner } = useGlobalLoadingState()

  useHydrateAtoms([[userAgentAtom, new UAParser(userAgent)]])

  return (
    <LoadingOverlayProvider message={message} isLoading={isLoading} hideSpinner={hideSpinner} asChild>
      {children}
    </LoadingOverlayProvider>
  )
}

export default MainProvider
