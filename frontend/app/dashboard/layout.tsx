"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import DashboardNav from "@/components/DashboardNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf2f8] via-white to-[#f0fdfa]">
        <div className="text-lg font-medium text-[#8b5cf6]">Loading your dashboard...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-white to-[#f0fdfa]">
      <DashboardNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
