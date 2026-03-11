"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toaster } from "@/components/ui/toaster"
import { Download, LogOut, Mail, Trash2, Eye, Search, Users, Link } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvitationLinkManager } from "@/components/invitation-link-manager"
import { DatabaseStatus } from "@/components/database-status"
import type { Reservation } from "@/lib/db"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    notAttending: 0,
    totalGuests: 0,
  })
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem("adminAuth")

    if (!auth) {
      router.push("/admin")
      return
    }

    setIsAuthenticated(true)
    fetchReservations()
  }, [router])

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/admin/reservations", {
        headers: {
          Authorization: `Bearer admin-token`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reservations")
      }

      const data = await response.json()
      console.log("Fetched reservations:", data);
      
      setReservations(data.data.reservations)
      setStats(data.data.stats)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reservations. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredReservations = reservations.filter((reservation) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      reservation.name.toLowerCase().includes(searchLower) ||
      reservation.email.toLowerCase().includes(searchLower) ||
      reservation.phone.includes(searchTerm)
    )
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Address", "Status", "Guests", "Message", "Submitted", "Invitation Code"]
    const csvRows = [headers]

    reservations.forEach((r) => {
      csvRows.push([
        r.name,
        r.email,
        r.phone,
        r.address,
        r.attending ? "Attending" : "Not Attending",
        r.attending ? String(r.guests + 1) : "0",
        r.message || "",
        r.submittedAt ? formatDate(r.submittedAt.toString()) : "",
        r.invitationCode || "",
      ])
    })

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `wedding-rsvps-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const viewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
  }

  const closeReservationView = () => {
    setSelectedReservation(null)
  }

  const handleDeleteReservation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this reservation?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reservations?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer admin-token`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete reservation")
      }

      toast({
        title: "Success",
        description: "Reservation deleted successfully.",
      })

      // Refresh reservations
      fetchReservations()
    } catch (error) {
      console.error("Error deleting reservation:", error)
      toast({
        title: "Error",
        description: "Failed to delete reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-[#d4af37]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-wedding-cream text-wedding-charcoal">
      <header className="bg-white py-6 px-8 flex items-center justify-between border-b border-wedding-sage/10 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-wedding-cream flex items-center justify-center border border-wedding-sage/10">
              <span className="text-sm font-cormorant text-wedding-gold italic">E&J</span>
           </div>
           <h1 className="text-xl font-cormorant text-wedding-charcoal tracking-wide">Admin Dashboard</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-wedding-charcoal/60 hover:text-wedding-sage hover:bg-wedding-sage/5 tracking-widest uppercase text-[10px]">
          <LogOut className="h-3 w-3 mr-2" />
          Logout
        </Button>
      </header>

      <div className="p-6">
        {/* Database Status Component */}
        <DatabaseStatus />

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white p-6 border border-wedding-sage/5 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-wedding-charcoal/40 mb-1">Total Responses</div>
            <div className="text-3xl font-light text-wedding-charcoal">{stats.total}</div>
          </div>
          <div className="bg-white p-6 border border-wedding-sage/5 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-wedding-charcoal/40 mb-1">Attending</div>
            <div className="text-3xl font-light text-wedding-sage">{stats.attending}</div>
          </div>
          <div className="bg-white p-6 border border-wedding-sage/5 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-wedding-charcoal/40 mb-1">Not Attending</div>
            <div className="text-3xl font-light text-red-400">{stats.notAttending}</div>
          </div>
          <div className="bg-white p-6 border border-wedding-sage/5 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-wedding-charcoal/40 mb-1">Total Guests</div>
            <div className="text-3xl font-light text-wedding-gold">{stats.totalGuests}</div>
          </div>
        </motion.div>

        <Tabs defaultValue="reservations" className="mb-8">
          <TabsList className="bg-white border border-wedding-sage/10 rounded-none p-1">
            <TabsTrigger
              value="reservations"
              className="rounded-none data-[state=active]:bg-wedding-sage data-[state=active]:text-white tracking-widest uppercase text-[10px] px-6"
            >
              <Users className="h-3 w-3 mr-2" />
              Reservations
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="rounded-none data-[state=active]:bg-wedding-sage data-[state=active]:text-white tracking-widest uppercase text-[10px] px-6"
            >
              <Link className="h-3 w-3 mr-2" />
              Invitation Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="mt-6">
            <motion.div
              className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-charcoal/30" />
                <Input
                  placeholder="Search by name, email, or phone"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-12 bg-white border-wedding-sage/10 focus:border-wedding-gold/30 rounded-none h-12"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExportCSV} className="bg-wedding-sage text-white hover:bg-wedding-sage/90 rounded-none h-12 px-8 tracking-widest uppercase text-xs shadow-md">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="bg-white border border-wedding-sage/10 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-wedding-sage/10 bg-wedding-cream/30">
                      <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5 px-6">Name</TableHead>
                      <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Contact</TableHead>
                      <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Status</TableHead>
                      <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Guests</TableHead>
                      <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5">Submitted</TableHead>
                      <TableHead className="text-wedding-charcoal uppercase tracking-widest text-[10px] font-bold py-5 px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.length > 0 ? (
                      filteredReservations.map((reservation) => (
                        <TableRow key={reservation.id} className="border-b border-wedding-sage/5 hover:bg-wedding-cream/20 transition-colors">
                          <TableCell className="font-medium px-6 py-4">{reservation.name}</TableCell>
                          <TableCell className="py-4">
                            <div className="text-xs">{reservation.email}</div>
                            <div className="text-wedding-charcoal/50 text-[10px]">{reservation.phone}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase ${
                                reservation.attending ? "bg-wedding-sage/10 text-wedding-sage" : "bg-red-50 text-red-400"
                              }`}
                            >
                              {reservation.attending ? "Attending" : "Declined"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 font-light">{reservation.attending ? reservation.guests + 1 : 0}</TableCell>
                          <TableCell className="py-4 text-[10px] text-wedding-charcoal/50">{reservation.submittedAt ? formatDate(reservation.submittedAt.toString()) : "N/A"}</TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-wedding-charcoal/40 hover:text-wedding-sage hover:bg-wedding-sage/5"
                                onClick={() => viewReservation(reservation)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-wedding-charcoal/40 hover:text-wedding-sage hover:bg-wedding-sage/5"
                                onClick={() => window.open(`mailto:${reservation.email}`)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-wedding-charcoal/40 hover:text-red-400 hover:bg-red-50"
                                onClick={() => handleDeleteReservation(reservation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-wedding-charcoal/40 font-light italic">
                          No reservations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <InvitationLinkManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-wedding-charcoal/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-wedding-sage/10 shadow-2xl relative">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-cormorant text-wedding-charcoal italic">Reservation Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeReservationView}
                className="text-wedding-charcoal/40 hover:text-wedding-charcoal hover:bg-transparent"
              >
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

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Full Name</h3>
                  <p className="text-xl font-cormorant">{selectedReservation.name}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Status</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase ${
                      selectedReservation.attending ? "bg-wedding-sage/10 text-wedding-sage" : "bg-red-50 text-red-400"
                    }`}
                  >
                    {selectedReservation.attending ? "Attending" : "Declined"}
                  </span>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Email</h3>
                  <p className="font-light">{selectedReservation.email}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Phone</h3>
                  <p className="font-light">{selectedReservation.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Address</h3>
                  <p className="font-light leading-relaxed">{selectedReservation.address}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Guests</h3>
                  <p className="font-light">{selectedReservation.attending ? selectedReservation.guests + 1 : 0}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Submitted</h3>
                  <p className="font-light">{selectedReservation.submittedAt ? formatDate(selectedReservation.submittedAt.toString()) : "N/A"}</p>
                </div>
                {selectedReservation.invitationCode && (
                  <div className="md:col-span-2">
                    <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-1">Invitation Code</h3>
                    <p className="text-[10px] font-mono bg-wedding-cream p-3 border border-wedding-sage/5">{selectedReservation.invitationCode}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-wedding-charcoal/40 mb-2">Message</h3>
                <p className="p-5 bg-wedding-cream border border-wedding-sage/5 font-light italic leading-relaxed">
                  {selectedReservation.message ? `"${selectedReservation.message}"` : "No message provided."}
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-wedding-sage/10">
                <Button
                  variant="outline"
                  className="border-wedding-sage/30 text-wedding-sage hover:bg-wedding-sage/5 rounded-none tracking-widest uppercase text-xs"
                  onClick={() => window.open(`mailto:${selectedReservation.email}`)}
                >
                  <Mail className="h-3 w-3 mr-2" />
                  Email Guest
                </Button>
                <Button className="bg-wedding-sage text-white hover:bg-wedding-sage/90 rounded-none tracking-widest uppercase text-xs px-8 shadow-md" onClick={closeReservationView}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </main>
  )
}
