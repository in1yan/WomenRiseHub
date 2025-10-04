"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/AuthContext"
import { ProjectsProvider } from "@/contexts/ProjectsContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProjectsProvider>{children}</ProjectsProvider>
    </AuthProvider>
  )
}
