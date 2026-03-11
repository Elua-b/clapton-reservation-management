"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { motion } from "framer-motion"

export default function AdminLoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials({
      ...credentials,
      [name]: value,
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would validate against your API
      // For demo purposes, we'll use hardcoded credentials
      if (credentials.username === "admin" && credentials.password === "password") {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Set a session token in localStorage (in a real app, use secure cookies)
        localStorage.setItem("adminAuth", "true")

        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        })

        router.push("/admin/dashboard")
      } else {
        setError("Invalid username or password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-wedding-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] bg-repeat opacity-[0.03] select-none pointer-events-none"></div>

      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-10">
           <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-cormorant text-wedding-gold italic">E&J</span>
           </div>
          <h1 className="text-3xl font-cormorant text-wedding-charcoal mb-2">Admin Access</h1>
          <p className="text-wedding-charcoal/60 text-sm tracking-widest uppercase">Sign in to manage reservations</p>
        </div>

        <div className="bg-white p-8 md:p-10 border border-wedding-sage/10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/5 border border-red-500/20 text-red-500 text-xs p-3 mb-4">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="bg-wedding-cream/50 border-wedding-sage/10 focus:border-wedding-gold/30 rounded-none h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="bg-wedding-cream/50 border-wedding-sage/10 focus:border-wedding-gold/30 rounded-none h-12"
              />
            </div>

            <Button type="submit" className="w-full bg-wedding-sage text-white hover:bg-wedding-sage/90 h-14 tracking-widest uppercase rounded-none transition-all duration-300 shadow-md" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center text-wedding-charcoal/40 text-[10px] uppercase tracking-widest">
            <p>For demo: admin / password</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-wedding-charcoal/40 hover:text-wedding-sage text-xs tracking-widest uppercase transition-colors duration-300">
            ← Return to wedding site
          </Link>
        </div>
      </motion.div>

      <Toaster />
    </main>
  )
}
