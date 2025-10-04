"use client"

import type React from "react"
import { ProjectsProvider as ProjectsContextProvider } from "./ProjectsContext"

export default function ProjectsProvider({ children }: { children: React.ReactNode }) {
  return <ProjectsContextProvider>{children}</ProjectsContextProvider>
}
