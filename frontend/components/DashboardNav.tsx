"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import NotificationBell from "./NotificationBell"
import { Heart, Menu, X, Home, User, Search, FolderKanban, BarChart3, LogOut, Bell } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"

export default function DashboardNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: Search, label: "Search Opportunities", href: "/dashboard/search" },
    { icon: FolderKanban, label: "Projects", href: "/dashboard/projects" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
    setSidebarOpen(false)
  }

  useEffect(() => {
    if (!sidebarOpen) {
      return
    }

    const originalOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false)
      }
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [sidebarOpen])

  return (
    <>
      <nav className="bg-white border-b border-[#f3e8ff] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="sr-only">WomenRiseHub dashboard home</span>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent truncate">
                WomenRiseHub
                </h1>
              </Link>
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-lg"
                          : "text-[#6b7280] hover:text-[#ec4899] hover:bg-[#fce7f3]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 md:gap-4 flex-shrink-0">
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
              <Link
                href="/donate"
                className="hidden sm:inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white text-sm md:text-base font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden md:inline">Donate</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#ec4899] hover:bg-[#fce7f3] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-[#f3e8ff] hover:bg-[#fce7f3] transition-colors lg:hidden"
                aria-label="Toggle menu"
                aria-expanded={sidebarOpen}
                aria-controls="dashboard-mobile-menu"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-[#ec4899]" /> : <Menu className="w-5 h-5 text-[#ec4899]" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              id="dashboard-mobile-menu"
              className="fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
                    Menu
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-[#fce7f3] transition-colors"
                  >
                    <X className="w-6 h-6 text-[#ec4899]" />
                  </button>
                </div>

                {/* User Info */}
                <div className="mb-8 p-4 bg-gradient-to-br from-[#fce7f3] to-[#f3e8ff] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1f2937]">{user?.fullName || "User"}</p>
                      <p className="text-sm text-[#6b7280]">{user?.email}</p>
                      {user?.id && (
                        <p className="text-xs text-[#9ca3af]">Volunteer ID: {user.id}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2 mb-8">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-lg"
                            : "text-[#6b7280] hover:bg-[#fce7f3] hover:text-[#ec4899]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                <div className="space-y-3 mb-8">
                  <Link
                    href="/donate"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-semibold shadow-lg"
                  >
                    <Heart className="w-5 h-5" />
                    Support WomenRiseHub
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
