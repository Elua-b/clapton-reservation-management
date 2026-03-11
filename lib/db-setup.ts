import { sql } from "@vercel/postgres";

export async function setupDatabase() {
  try {
    console.log("Setting up database tables...");
    //create reservation table sql
    // Create reservation table matching the application schema
    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        attending BOOLEAN NOT NULL DEFAULT TRUE,
        guests INTEGER NOT NULL DEFAULT 0,
        message TEXT,
        invitation_code VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    // Create the invitation_links table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS invitation_links (
        id SERIAL PRIMARY KEY,
        code UUID NOT NULL UNIQUE,
        max_uses INTEGER NOT NULL,
        used_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by VARCHAR(255) NOT NULL
      );
    `;

    // Create index on code for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_invitation_links_code ON invitation_links(code);
    `;

    console.log("Database setup completed successfully");
    return { success: true, message: "Database setup completed successfully" };
  } catch (error) {
    console.error("Error setting up database:", error);
    return {
      success: false,
      message: `Database setup failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function testDatabaseConnection() {
  try {
    // Simple query to test the connection
    const result = await sql`SELECT NOW() as time;`;
    return {
      success: true,
      message: "Database connection successful",
      timestamp: result.rows[0].time,
    };
  } catch (error) {
    console.error("Database connection test failed:", error);
    return {
      success: false,
      message: `Database connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
