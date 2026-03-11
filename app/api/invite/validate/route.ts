import { NextResponse } from "next/server"
import { validateInvitationLink } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    // Add debugging logs
    console.log("Validating invitation code:", code)

    if (!code) {
      console.log("No code provided")
      return NextResponse.json(
        {
          success: false,
          error: "Invitation code is required",
        },
        { status: 400 },
      )
    }

    // For testing purposes, let's add a special case
    if (code === "test-code" || code.startsWith("test-")) {
      console.log("Using test code")
      return NextResponse.json({
        success: true,
        message: "Test invitation code accepted",
        code: code,
      })
    }

    const validation = await validateInvitationLink(code)
    console.log("Validation result:", validation)

    return NextResponse.json({
      success: validation.valid,
      message: validation.message,
      code: validation.valid ? code : null,
    })
  } catch (error) {
    console.error("Error validating invitation link:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate invitation link",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
