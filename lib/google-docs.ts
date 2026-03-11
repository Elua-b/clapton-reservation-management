// This is a mock service for Google Docs integration
// In a real application, you would use the Google Docs API

import type { Reservation } from "./db"

// The specific Google Doc ID provided by the user
const WEDDING_DOC_ID = "1F7DocpwySveVfRacmm-UcGCsmmGJ0kyXrQPAGtfpXKY"

export async function exportToGoogleDocs(data: any): Promise<string> {
  // In a real app, this would use the Google Docs API to update the specific document
  // For demo purposes, we'll simulate the export

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return the specific document ID
  return WEDDING_DOC_ID
}

export async function importFromGoogleDocs(): Promise<Reservation[]> {
  // In a real app, this would use the Google Docs API to fetch document content
  // For demo purposes, we'll simulate the import from the specific document

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return [
    {
      id: 99999,
      name: "Alex Thompson",
      email: "alex@example.com",
      phone: "555-555-5555",
      address: "987 Cedar Lane, Somewhere, CA 24680",
      attending: true,
      guests: 2,
      message: "Looking forward to the wedding!",
      submittedAt: new Date(),
      invitationCode: null,
    },
  ]
}

export function formatReservationsForGoogleDocs(reservations: Reservation[]): string {
  // In a real app, this would format the data for Google Docs
  // For demo purposes, we'll return a simple string

  let content = "Wedding Reservations\n\n"

  reservations.forEach((reservation, index) => {
    content += `Reservation #${index + 1}\n`
    content += `Name: ${reservation.name}\n`
    content += `Email: ${reservation.email}\n`
    content += `Phone: ${reservation.phone || "N/A"}\n`
    content += `Address: ${reservation.address || "N/A"}\n`
    content += `Attending: ${reservation.attending ? "Yes" : "No"}\n`
    content += `Guests: ${reservation.attending ? reservation.guests + 1 : 0}\n`
    content += `Message: ${reservation.message || "None"}\n`
    content += `Submitted: ${reservation.submittedAt ? new Date(reservation.submittedAt).toLocaleString() : "N/A"}\n\n`
  })

  return content
}

export function getGoogleDocUrl(): string {
  return `https://docs.google.com/document/d/${WEDDING_DOC_ID}/edit`
}
