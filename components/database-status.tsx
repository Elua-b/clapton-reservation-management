"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Database, RefreshCw } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("")
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/admin/db-setup")
      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setMessage(data.message)
        setTimestamp(data.connectionTest?.timestamp || null)
      } else {
        setStatus("error")
        setMessage(data.message || "Failed to connect to database")
      }
    } catch (error) {
      console.error("Error checking database status:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsChecking(false)
    }
  }

  const setupDatabase = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/admin/db-setup")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Database tables created successfully",
        })
        setStatus("connected")
        setMessage(data.message)
        setTimestamp(data.connectionTest?.timestamp || null)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to set up database",
          variant: "destructive",
        })
        setStatus("error")
        setMessage(data.message || "Failed to set up database")
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="bg-white p-8 border border-wedding-sage/10 shadow-sm mb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-cormorant text-wedding-charcoal italic tracking-wide">Database Infrastructure</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={checkDatabaseStatus}
          disabled={isChecking}
          className="border-wedding-sage/30 text-wedding-sage hover:bg-wedding-sage/5 rounded-none tracking-widest uppercase text-[10px]"
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            status === "loading" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" : status === "connected" ? "bg-wedding-sage shadow-[0_0_8px_rgba(132,148,131,0.3)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]"
          }`}
        ></div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-wedding-charcoal/60">
          {status === "loading" ? "Status: Verifying..." : status === "connected" ? "Status: Operational" : "Status: Connection Error"}
        </span>
      </div>

      <div className="text-xs text-wedding-charcoal/70 mb-6 font-light leading-relaxed max-w-xl">{message}</div>

      {timestamp && (
        <div className="text-[10px] text-wedding-charcoal/30 mb-6 uppercase tracking-tighter">Last synchronization: {new Date(timestamp).toLocaleString()}</div>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={setupDatabase}
          disabled={isChecking}
          className="border-wedding-sage/30 text-wedding-sage hover:bg-wedding-sage/5 rounded-none tracking-widest uppercase text-[10px] px-6"
        >
          <Database className="h-3 w-3 mr-2 text-wedding-gold" />
          Initialize Tables
        </Button>
      </div>
    </div>
  )
}
