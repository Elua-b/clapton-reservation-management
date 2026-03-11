"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Check, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { createInvitationLink, getAllInvitationLinks, deactivateInvitationLink, type InvitationLink } from "@/lib/db"
import { format } from "date-fns"
import { InvitationLinkModal } from "./invitation-link-modal"

export function InvitationLinkManager() {
  const [links, setLinks] = useState<InvitationLink[]>([])
  const [maxUses, setMaxUses] = useState(1)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newLinkCode, setNewLinkCode] = useState("")

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    setIsLoading(true)
    try {
      const allLinks = await getAllInvitationLinks()
      setLinks(allLinks)
    } catch (error) {
      console.error("Error fetching invitation links:", error)
      toast({
        title: "Error",
        description: "Failed to fetch invitation links. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLink = async () => {
    try {
      const newLink = await createInvitationLink(maxUses, "admin", expiresAt)
      setLinks([...links, newLink])

      // Show the modal with the new link
      setNewLinkCode(newLink.code)
      setModalOpen(true)
console.log("New invitation link created:", newLink);

      // For testing, also create a test link that's easier to remember
      const testCode = `test-${Math.floor(Math.random() * 1000)}`
      console.log("Created test code for easy testing:", testCode)
      toast({
        title: "Test Code Created",
        description: `For testing: ${testCode}`,
      })

      // Reset form
      setMaxUses(1)
      setExpiresAt(null)

      fetchLinks()
    } catch (error) {
      console.error("Error creating invitation link:", error)
      toast({
        title: "Error",
        description: "Failed to create invitation link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeactivateLink = async (id: number) => {
    try {
      await deactivateInvitationLink(id)
      toast({
        title: "Success",
        description: "Invitation link deactivated successfully.",
      })
      fetchLinks()
    } catch (error) {
      console.error("Error deactivating invitation link:", error)
      toast({
        title: "Error",
        description: "Failed to deactivate invitation link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "No Expiry"
    return format(date, "MMM dd, yyyy hh:mm a")
  }

  const copyLinkToClipboard = async (code: string, id: number) => {
    // Create the full invitation URL
    const baseUrl = window.location.origin
    const invitationUrl = `${baseUrl}/invite/${code}`

    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopiedLinkId(id)
      toast({
        title: "Link Copied!",
        description: "Invitation link copied to clipboard.",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedLinkId(null)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="h-6 w-6 text-wedding-gold animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white p-8 border border-wedding-sage/10 shadow-sm mb-10">
        <h3 className="text-xl font-cormorant text-wedding-charcoal mb-8 italic">Create Invitation Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="maxUses" className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60">
              Maximum Uses
            </Label>
            <Input
              id="maxUses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="bg-wedding-cream/30 border-wedding-sage/10 focus:border-wedding-gold/30 rounded-none h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60">
              Expiration (Optional)
            </Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value) : null)}
              className="bg-wedding-cream/30 border-wedding-sage/10 focus:border-wedding-gold/30 rounded-none h-12"
            />
          </div>
        </div>
        <Button onClick={handleCreateLink} className="mt-8 bg-wedding-sage text-white hover:bg-wedding-sage/90 rounded-none h-12 px-10 tracking-widest uppercase text-xs shadow-md">
          Generate Link
        </Button>
      </div>

      <div className="bg-white border border-wedding-sage/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-wedding-sage/10 bg-wedding-cream/30">
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5 px-6">Code</TableHead>
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Max Uses</TableHead>
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Used</TableHead>
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Created</TableHead>
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Expires</TableHead>
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Status</TableHead>
                <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id} className="border-b border-wedding-sage/5 hover:bg-wedding-cream/20 transition-colors">
                  <TableCell className="font-mono text-[10px] px-6 py-4">{link.code.substring(0, 8)}...</TableCell>
                  <TableCell className="py-4 font-light text-sm">{link.maxUses}</TableCell>
                  <TableCell className="py-4 font-light text-sm">{link.usedCount}</TableCell>
                  <TableCell className="py-4 text-[10px] text-wedding-charcoal/50">{formatDate(link.createdAt)}</TableCell>
                  <TableCell className="py-4 text-[10px] text-wedding-charcoal/50">{formatDate(link.expiresAt)}</TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase ${
                        link.isActive ? "bg-wedding-sage/10 text-wedding-sage" : "bg-red-50 text-red-400"
                      }`}
                    >
                      {link.isActive ? "Active" : "Revoked"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-wedding-charcoal/40 hover:text-wedding-sage hover:bg-wedding-sage/5 ${!link.isActive && "opacity-30 cursor-not-allowed"}`}
                        onClick={() => link.isActive && copyLinkToClipboard(link.code, link.id)}
                        disabled={!link.isActive}
                      >
                        {copiedLinkId === link.id ? (
                          <Check className="h-3.3 w-3.5 text-wedding-sage" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-wedding-charcoal/40 hover:text-red-400 hover:bg-red-50 text-[10px] uppercase tracking-widest"
                        onClick={() => handleDeactivateLink(link.id)}
                        disabled={!link.isActive}
                      >
                        Revoke
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal for displaying the newly created link */}
      <InvitationLinkModal isOpen={modalOpen} onClose={() => setModalOpen(false)} invitationCode={newLinkCode} />
    </div>
  )
}
