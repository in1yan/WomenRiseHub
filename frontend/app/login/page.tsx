"use client"

import type React from "react"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const success = await login(formData.email, formData.password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] p-4">
      {/* Logo & Header */}
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-full mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              aria-hidden="true"
              role="img"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M12 13v8" />
              <path d="M9 18h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1f2937] mb-2">WomenRiseHub</h1>
          <p className="text-[#6b7280] leading-relaxed">Welcome back! Empower, Lead, and Volunteer.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-10 border border-[#f3e8ff]">
          <h2 className="text-2xl font-semibold text-[#1f2937] mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="email" className="block text-sm font-medium text-[#1f2937] mb-2">
              Email or Phone Number
            </label>
            <InputGroup className="bg-[#fce7f3]/20">
              <InputGroupAddon>
                <Mail className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email or phone"
              />
            </InputGroup>

            <label htmlFor="password" className="block text-sm font-medium text-[#1f2937] mb-2">
              Password
            </label>
            <InputGroup className="bg-[#fce7f3]/20">
              <InputGroupAddon>
                <Lock className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  variant="ghost"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9ca3af] hover:text-[#ec4899]"
                  type="button"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-[#ec4899] hover:text-[#db2777] font-medium">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ec4899] to-[#db2777] hover:from-[#db2777] hover:to-[#be185d] text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6b7280]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#ec4899] hover:text-[#db2777] font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
