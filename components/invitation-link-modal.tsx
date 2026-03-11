"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface InvitationLinkModalProps {
  isOpen: boolean
  onClose: () => void
  invitationCode: string
}

export function InvitationLinkModal({ isOpen, onClose, invitationCode }: InvitationLinkModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const invitationUrl = `${baseUrl}/invite/${invitationCode}`

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      toast({
        title: "Link Copied!",
        description: "Invitation link copied to clipboard.",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-wedding-charcoal/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 max-w-md w-full border border-wedding-sage/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-cormorant text-wedding-charcoal italic tracking-wide">Access Generated</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-wedding-charcoal/40 hover:text-wedding-charcoal hover:bg-transparent">
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <p className="text-wedding-charcoal/60 mb-6 font-light leading-relaxed text-sm">Your unique invitation link is ready. Share this with your guests to grant them access to the RSVP portal.</p>

        <div className="flex items-center gap-2 mb-10">
          <Input
            value={invitationUrl}
            readOnly
            className="font-mono text-[10px] bg-wedding-cream border-wedding-sage/10 rounded-none h-12"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyLinkToClipboard}
            className="border-wedding-sage/30 text-wedding-sage hover:bg-wedding-sage/5 h-12 w-12 flex-shrink-0 animate-in fade-in zoom-in duration-300"
          >
            {copied ? <Check className="h-4 w-4 text-wedding-sage" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="bg-wedding-cream p-6 border border-wedding-sage/5 mb-10">
          <h3 className="text-[10px] uppercase tracking-widest text-wedding-gold font-bold mb-3">Usage Guidelines</h3>
          <ul className="space-y-2 text-[10px] text-wedding-charcoal/50 leading-relaxed uppercase tracking-widest">
            <li className="flex gap-2"><span>•</span> <span>Active until usage limit is reached</span></li>
            <li className="flex gap-2"><span>•</span> <span>Automatically authenticates guests upon arrival</span></li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button className="bg-wedding-sage text-white hover:bg-wedding-sage/90 rounded-none h-12 px-10 tracking-widest uppercase text-xs shadow-md" onClick={onClose}>
            Complete
          </Button>
        </div>
      </div>
    </div>
  )
}
