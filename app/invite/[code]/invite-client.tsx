"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"

interface InviteClientProps {
  code: string
}

export function InviteClient({ code }: InviteClientProps) {
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const validateInvitation = async () => {
      try {
        // Add console logs for debugging
        console.log("Validating invitation code:", code)

        const response = await fetch(`/api/invite/validate?code=${code}`)
        const data = await response.json()

        console.log("Validation response:", data)

        setIsValid(data.success)
        setMessage(data.message)

        if (data.success) {
          // Store the invitation code in session storage
          sessionStorage.setItem("invitationCode", code)

          // Show success toast
          toast({
            title: "Valid Invitation",
            description: "Redirecting you to the RSVP form...",
          })

          // Redirect to the RSVP form after a short delay
          setTimeout(() => {
            router.push("/#rsvp")
          }, 2000)
        }
      } catch (error) {
        console.error("Error validating invitation:", error)
        setIsValid(false)
        setMessage("An error occurred while validating your invitation")
      } finally {
        setIsValidating(false)
      }
    }

    validateInvitation()
  }, [code, router])

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121212] rounded-lg p-8 border border-[#d4af37]/20 text-center">
        <h1 className="text-3xl font-cormorant text-[#d4af37] mb-6">Wedding Invitation</h1>

        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/20 border-t-[#d4af37] animate-spin mb-4"></div>
            <p className="text-white/70">Validating your invitation...</p>
          </div>
        ) : isValid ? (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#d4af37]"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-xl text-white mb-2">Valid Invitation</h2>
            <p className="text-white/70 mb-6">{message}</p>
            <p className="text-white/70 mb-6">Redirecting you to the RSVP form...</p>
            <Button className="bg-[#d4af37] text-black hover:bg-[#d4af37]/90" onClick={() => router.push("/#rsvp")}>
              Go to RSVP Form
            </Button>
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h2 className="text-xl text-white mb-2">Invalid Invitation</h2>
            <p className="text-white/70 mb-6">{message}</p>
            <Button
              variant="outline"
              className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10"
              onClick={() => router.push("/")}
            >
              Return to Homepage
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </main>
  )
}
