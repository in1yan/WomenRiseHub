"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { User, Mail, Phone, Lock, AlertCircle } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const MAX_PHONE_LENGTH = 15
  const normalizePhoneInput = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, "")
    const hasPlus = cleaned.startsWith("+")
    const digits = cleaned.replace(/\+/g, "")
    const limit = hasPlus ? MAX_PHONE_LENGTH - 1 : MAX_PHONE_LENGTH
    const trimmed = digits.slice(0, Math.max(0, limit))
    return hasPlus ? `+${trimmed}` : trimmed
  }
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const success = await signup({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    })

    if (success) {
      router.push("/dashboard?showProfilePrompt=true")
    } else {
      setError("Email already exists")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] p-4">
      <div className="w-full max-w-xl">
        {/* Top women empowerment icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ff4081] to-[#ec4899] rounded-full mb-4 shadow-lg">
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
          <h1 className="text-3xl font-bold text-[#1f2937] mb-2">Join WomenRiseHub</h1>
          <p className="text-[#6b7280] text-sm leading-relaxed">Create your account and start making an impact</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-10 border border-[#f3e8ff]">
          <h2 className="text-xl font-bold text-[#1f2937] mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <label htmlFor="fullName" className="block text-sm font-semibold text-[#1f2937] mb-2">
              Full Name
            </label>
            <InputGroup className="bg-[#fce7f3]/30">
              <InputGroupAddon>
                <User className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="text-sm"
              />
            </InputGroup>

            {/* Email */}
            <label htmlFor="email" className="block text-sm font-semibold text-[#1f2937] mb-2">
              Email
            </label>
            <InputGroup className="bg-[#fce7f3]/30">
              <InputGroupAddon>
                <Mail className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="text-sm"
              />
            </InputGroup>

            {/* Phone */}
            <label htmlFor="phone" className="block text-sm font-semibold text-[#1f2937] mb-2">
              Phone Number
            </label>
            <InputGroup className="bg-[#fce7f3]/30">
              <InputGroupAddon>
                <Phone className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="phone"
                type="tel"
                required
                value={formData.phone}
                maxLength={MAX_PHONE_LENGTH}
                onChange={(e) => setFormData({ ...formData, phone: normalizePhoneInput(e.target.value) })}
                placeholder="Enter your phone number"
                className="text-sm"
              />
            </InputGroup>

            {/* Password */}
            <label htmlFor="password" className="block text-sm font-semibold text-[#1f2937] mb-2">
              Password
            </label>
            <InputGroup className="bg-[#fce7f3]/30">
              <InputGroupAddon>
                <Lock className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                className="text-sm"
              />
            </InputGroup>

            {/* Confirm Password */}
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#1f2937] mb-2">
              Confirm Password
            </label>
            <InputGroup className="bg-[#fce7f3]/30">
              <InputGroupAddon>
                <Lock className="w-5 h-5 text-[#9ca3af]" />
              </InputGroupAddon>
              <InputGroupInput
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="text-sm"
              />
            </InputGroup>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff4081] hover:bg-[#e91e63] text-white 
                         font-bold py-3 rounded-lg transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6b7280] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ff4081] hover:text-[#e91e63] font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
