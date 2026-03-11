import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { username, password } = body

    // In a real app, you would validate against a database
    // This is a simplified example with hardcoded credentials
    if (username === "admin" && password === "password") {
      // Generate a token (in a real app, use a proper JWT library)
      const token = "admin-token"

      // Return success response with token
      return NextResponse.json({
        success: true,
        token,
      })
    }

    // Return authentication error
    return NextResponse.json(
      {
        success: false,
        error: "Invalid credentials",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Authentication error:", error)

    // Return generic error
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 },
    )
  }
}
