"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminLogin() {
  const router = useRouter()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simple demo credentials for development
    // In production, use proper authentication
    const ADMIN_EMAIL = "admin@newsletter.com"
    const ADMIN_PASSWORD = "admin123"

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = "demo-token-" + Date.now()
      login(token)
      router.push("/admin/dashboard")
    } else {
      setError("Invalid credentials. Try admin@newsletter.com / admin123")
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card p-8">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-center text-sm text-muted-foreground">Sign in to manage your newsletter</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="admin@newsletter.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo credentials: admin@newsletter.com / admin123
        </p>
      </Card>
    </main>
  )
}
