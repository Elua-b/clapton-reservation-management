import { NextResponse } from "next/server"
import { addReservation, incrementInvitationLinkUsage } from "@/lib/db"
import { z } from "zod"

// Form validation schema
import { rsvpFormSchema } from "@/lib/schema"

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate with Zod schema
    const validatedData = rsvpFormSchema.parse(body)

    // Convert form data to database format
    const reservationData = {
      name: validatedData.name,
      email: validatedData.email || "wish@example.com",
      phone: validatedData.phone || null,
      address: validatedData.address || "N/A",
      attending: validatedData.attending ? validatedData.attending === "yes" : true,
      guests: validatedData.guests ?? 0,
      message: validatedData.message || null,
      invitationCode: validatedData.invitationCode || "WISH_SUBMISSION",
    }

    // Add to database
    const newReservation = await addReservation(reservationData)
   
    // If there's an invitation code, increment its usage
    if (validatedData.invitationCode) {
      await incrementInvitationLinkUsage(validatedData.invitationCode)
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: newReservation,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("RSVP submission error:", error)

    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    // Return generic error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit RSVP",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
