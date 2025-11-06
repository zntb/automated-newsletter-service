"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simple email validation
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email")
      }

      setStatus("success")
      setMessage("Check your inbox to confirm your subscription!")
      setEmail("")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Something went wrong")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="bg-card"
          required
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      {status === "success" && (
        <div className="mt-4 flex items-center gap-2 text-accent">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  )
}
