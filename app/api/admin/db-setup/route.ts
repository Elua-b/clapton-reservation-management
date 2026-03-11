import { NextResponse } from "next/server"
import { setupDatabase, testDatabaseConnection } from "@/lib/db-setup"

export async function GET(request: Request) {
  try {
    // Test the database connection first
    const connectionTest = await testDatabaseConnection()

    if (!connectionTest.success) {
      return NextResponse.json(connectionTest, { status: 500 })
    }

    // If connection is successful, set up the database
    const setupResult = await setupDatabase()

    return NextResponse.json({
      ...setupResult,
      connectionTest,
    })
  } catch (error) {
    console.error("Error in database setup API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set up database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
