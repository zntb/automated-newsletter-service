"use client"

import type React from "react"

import { useAdminAuth } from "@/hooks/use-admin-auth"

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
