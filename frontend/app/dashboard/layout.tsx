"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Home, User, Search, FolderKanban, BarChart3 } from "lucide-react"
import { NotificationsProvider } from "@/contexts/NotificationsContext"
import DashboardNav from "@/components/DashboardNav"
import AuthProvider from "@/contexts/AuthProvider"
import ProjectsProvider from "@/contexts/ProjectsProvider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: Search, label: "Search Opportunities", href: "/dashboard/search" },
    { icon: FolderKanban, label: "Projects", href: "/dashboard/projects" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  ]

  return (
    <AuthProvider>
      <ProjectsProvider>
        <NotificationsProvider>
          <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-white to-[#f0fdfa]">
            <DashboardNav />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
          </div>
        </NotificationsProvider>
      </ProjectsProvider>
    </AuthProvider>
  )
}
