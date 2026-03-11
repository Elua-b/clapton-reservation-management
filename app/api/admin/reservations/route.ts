import { NextResponse } from "next/server"
import { getAllReservations, getReservationStats, deleteReservation } from "@/lib/db"

// Simple auth middleware (in a real app, use a proper auth solution)
async function checkAuth(request: Request) {
  // This is a simplified example
  // In a real app, you would verify a token from cookies or headers
  const authHeader = request.headers.get("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  // In a real app, you would verify this token
  const token = authHeader.split(" ")[1]
  return token === "admin-token"
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request)

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    // Get reservations
    const reservations = await getAllReservations()
    const stats = await getReservationStats()

    // Return success response
    return NextResponse.json({
      success: true,
      data: { reservations, stats },
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)

    // Return generic error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reservations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request)

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    // Get reservation ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation ID is required",
        },
        { status: 400 },
      )
    }

    // Delete reservation
    const success = await deleteReservation(Number.parseInt(id))

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found",
        },
        { status: 404 },
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting reservation:", error)

    // Return generic error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete reservation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
