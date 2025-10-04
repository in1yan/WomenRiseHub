"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const TOKEN_STORAGE_KEY = "womenrisehub_token"
const TOKEN_TYPE_STORAGE_KEY = "womenrisehub_token_type"
const MAX_PHONE_LENGTH = 15

interface BackendUser {
  id: string
  name: string
  email: string
  phonenumber: string
  city?: string | null
  country?: string | null
  skills?: string[] | null
  interests?: string[] | null
  story?: string | null
}

interface BackendTokenResponse {
  access_token: string
  token_type: string
}

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  skills: string[]
  interests: string[]
  bio: string
  profilePhoto: string
  location: {
    city: string
    country: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  isAuthenticated: boolean
}

interface SignupData {
  fullName: string
  email: string
  phone: string
  password: string
}

const sanitizePhone = (value: string) => {
  const cleaned = value.replace(/[^0-9+]/g, "")
  const hasPlusPrefix = cleaned.startsWith("+")
  const digitsOnly = cleaned.replace(/\+/g, "")
  const limit = hasPlusPrefix ? MAX_PHONE_LENGTH - 1 : MAX_PHONE_LENGTH
  const trimmedDigits = digitsOnly.slice(0, limit)
  return hasPlusPrefix ? `+${trimmedDigits}` : trimmedDigits
}

const normalizeUserId = (rawId: string) => {
  const id = (rawId || "").trim()
  if (!id) return ""
  return id.length === 3 ? id : id.padStart(3, "0").slice(-3)
}

const ensureStringArray = (values: string[] | null | undefined): string[] => {
  if (!Array.isArray(values)) return []
  return values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

const mapApiUserToUser = (apiUser: BackendUser): User => ({
  id: normalizeUserId(apiUser.id),
  fullName: apiUser.name || "",
  email: apiUser.email || "",
  phone: sanitizePhone(apiUser.phonenumber || ""),
  skills: ensureStringArray(apiUser.skills),
  interests: ensureStringArray(apiUser.interests),
  bio: apiUser.story || "",
  profilePhoto: "",
  location: {
    city: apiUser.city || "",
    country: apiUser.country || "",
  },
})

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // If you want the frontend to talk to a backend, set NEXT_PUBLIC_API_URL in your
  // environment (e.g. `.env.local`). When set, AuthContext will call the backend
  // endpoints implemented in the `backend/` folder: POST /login, POST /create/user,
  // GET /me. The backend uses JWT bearer tokens, so we store the token in
  // localStorage under `womenrisehub_token` and send it in the Authorization header.
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

  useEffect(() => {
    if (API_URL) {
      // Try to restore session using stored JWT token
      ;(async () => {
        try {
          const token = localStorage.getItem(TOKEN_STORAGE_KEY)
          const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
          if (!token) {
            setUser(null)
            setIsAuthenticated(false)
            return
          }

          const res = await fetch(`${API_URL.replace(/\/$/, "")}/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${tokenType} ${token}`,
            },
          })
          if (res.ok) {
            const data: BackendUser = await res.json()
            const mapped = mapApiUserToUser(data)
            setUser(mapped)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
            localStorage.removeItem(TOKEN_STORAGE_KEY)
            localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
          }
        } catch (err) {
          // network error -> treat as not authenticated
          setUser(null)
          setIsAuthenticated(false)
        }
      })()
    } else {
      // Fallback to localStorage-based mock (existing behavior)
      const storedUser = localStorage.getItem("womenrisehub_user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }
    }
  }, [API_URL])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (API_URL) {
      try {
        const res = await fetch(`${API_URL.replace(/\/$/, "")}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        })

        if (!res.ok) return false
        const data: BackendTokenResponse = await res.json()
        const token = data.access_token
        const tokenType = data.token_type || "Bearer"
        if (!token) return false
        // persist token
        localStorage.setItem(TOKEN_STORAGE_KEY, token)
        localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType)

        // fetch user info
        const meRes = await fetch(`${API_URL.replace(/\/$/, "")}/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${tokenType} ${token}`,
          },
        })
        if (!meRes.ok) return false
        const me: BackendUser = await meRes.json()
        const mapped = mapApiUserToUser(me)
        setUser(mapped)
        setIsAuthenticated(true)
        return true
      } catch (err) {
        return false
      }
    }

    // Fallback localStorage mock
    const storedUsers = JSON.parse(localStorage.getItem("womenrisehub_users") || "[]")
    const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password)
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem("womenrisehub_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const signup = async (data: SignupData): Promise<boolean> => {
    if (API_URL) {
      try {
        // backend expects: name, email, phonenumber, password at POST /create/user
        const res = await fetch(`${API_URL.replace(/\/$/, "")}/create/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.fullName,
            email: data.email.trim().toLowerCase(),
            phonenumber: sanitizePhone(data.phone),
            password: data.password,
          }),
        })
        if (!res.ok) return false

        // created. backend doesn't return a token, so log the user in to get a token
        const loggedIn = await login(data.email, data.password)
        return loggedIn
      } catch (err) {
        return false
      }
    }

    // Fallback localStorage mock
    const storedUsers = JSON.parse(localStorage.getItem("womenrisehub_users") || "[]")
    if (storedUsers.some((u: any) => u.email === data.email)) {
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email,
      phone: sanitizePhone(data.phone),
      skills: [],
      interests: [],
      bio: "",
      profilePhoto: "",
      location: { city: "", country: "" },
    }

    storedUsers.push({ ...newUser, password: data.password })
    localStorage.setItem("womenrisehub_users", JSON.stringify(storedUsers))

    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("womenrisehub_user", JSON.stringify(newUser))
    return true
  }

  const logout = async () => {
    if (API_URL) {
      try {
        await fetch(`${API_URL.replace(/\/$/, "")}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
      } catch (err) {
        // ignore network errors on logout
      }
      // remove persisted token and clear state
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
      setUser(null)
      setIsAuthenticated(false)
      return
    }

    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("womenrisehub_user")
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (API_URL) {
      try {
        if (!user) return false
        const token = localStorage.getItem(TOKEN_STORAGE_KEY)
        const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
        if (!token) return false

        const sanitizedSkills = ensureStringArray(data.skills ?? user.skills)
        const sanitizedInterests = ensureStringArray(data.interests ?? user.interests)

        const payload = {
          name: data.fullName ?? user.fullName,
          email: (data.email ?? user.email).trim().toLowerCase(),
          phonenumber: sanitizePhone(data.phone ?? user.phone),
          city: data.location?.city ?? user.location.city,
          country: data.location?.country ?? user.location.country,
          skills: sanitizedSkills,
          interests: sanitizedInterests,
          story: data.bio ?? user.bio,
        }

        const res = await fetch(`${API_URL.replace(/\/$/, "")}/update/user`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${tokenType} ${token}`,
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) return false

        const updated: BackendUser = await res.json()
        const mapped = mapApiUserToUser(updated)
        setUser(mapped)
        return true
      } catch (err) {
        return false
      }
    }

    if (user) {
      const sanitizedSkills = ensureStringArray(data.skills ?? user.skills)
      const sanitizedInterests = ensureStringArray(data.interests ?? user.interests)
      const updatedUser: User = {
        ...user,
        ...data,
        phone: data.phone !== undefined ? sanitizePhone(data.phone) : user.phone,
        location: {
          city: data.location?.city ?? user.location.city,
          country: data.location?.country ?? user.location.country,
        },
        bio: data.bio ?? user.bio,
        skills: sanitizedSkills,
        interests: sanitizedInterests,
      }
      setUser(updatedUser)
      localStorage.setItem("womenrisehub_user", JSON.stringify(updatedUser))

      const storedUsers = JSON.parse(localStorage.getItem("womenrisehub_users") || "[]")
      const updatedUsers = storedUsers.map((u: any) =>
        u.id === user.id
          ? {
              ...u,
              ...updatedUser,
              phone: updatedUser.phone,
              location: updatedUser.location,
            }
          : u,
      )
      localStorage.setItem("womenrisehub_users", JSON.stringify(updatedUsers))
      return true
    }

    return false
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
