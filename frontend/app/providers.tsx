"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/AuthContext"
import { ProjectsProvider } from "@/contexts/ProjectsContext"
import { NotificationsProvider } from "@/contexts/NotificationsContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </ProjectsProvider>
    </AuthProvider>
  )
}
