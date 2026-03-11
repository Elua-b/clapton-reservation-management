import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"

// This script can be run with `node -r esbuild-register lib/migrate.ts`
async function main() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  console.log("Running migrations...")

  const sql = neon(connectionString)
  const db = drizzle(sql)

  await migrate(db, { migrationsFolder: "drizzle" })

  console.log("Migrations completed!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:")
  console.error(err)
  process.exit(1)
})
