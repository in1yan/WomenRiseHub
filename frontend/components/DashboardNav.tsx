"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import NotificationBell from "./NotificationBell"
import { Heart, Menu, X, Home, User, Search, FolderKanban, BarChart3, LogOut } from "lucide-react"
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
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
    setSidebarOpen(false)
  }

  const isSearchPage = pathname === "/dashboard/search"

  return (
    <>
      <nav className="bg-white border-b border-[#f3e8ff] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
                WomenRiseHub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="pr-2">
                <NotificationBell />
              </div>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                {/* Heart icon already spaced by gap-2 */}
                <Heart className="w-4 h-4" />
                Donate
              </Link>
              {!isSearchPage && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-[#fce7f3] transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6 text-[#ec4899]" />
                </button>
              )}
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
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
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
