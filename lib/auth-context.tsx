"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("shopkeeper_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    console.log("[v0] Auth Context - login called with:", email)

    // Create user object from email
    const newUser = {
      email,
      name: email.split("@")[0], // Use email prefix as name
    }

    console.log("[v0] Auth Context - Created user object:", newUser)

    // Store in localStorage
    localStorage.setItem("shopkeeper_user", JSON.stringify(newUser))
    console.log("[v0] Auth Context - Stored user in localStorage")

    setUser(newUser)
    console.log("[v0] Auth Context - Set user state")

    // Redirect to dashboard
    console.log("[v0] Auth Context - Redirecting to /dashboard")
    router.push("/dashboard")
    console.log("[v0] Auth Context - router.push called")
  }

  const logout = () => {
    localStorage.removeItem("shopkeeper_user")
    setUser(null)
    router.push("/auth/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
