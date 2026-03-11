import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq } from "drizzle-orm"
import { pgTable, serial, varchar, text, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core"

// Configure neon to use fetch polyfill
neonConfig.fetchConnectionCache = true

// Define types for consistency
export interface Reservation {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  attending: boolean
  guests: number
  message: string | null
  submittedAt: Date
  invitationCode: string | null
}

export interface InvitationLink {
  id: number
  code: string
  maxUses: number
  usedCount: number
  createdAt: Date
  expiresAt: Date | null
  isActive: boolean
  createdBy: string
}

// Simple UUID generation function
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_jJKYnyC3e0uZ@ep-billowing-star-ad6kyczy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.")
}

// Create a database client
export const sql = neon(connectionString)
export const db = drizzle(sql)

// Define the schema for both tables
export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  attending: boolean("attending").notNull().default(true),
  guests: integer("guests").notNull().default(0),
  message: text("message"),
  invitationCode: varchar("invitation_code", { length: 255 }),
  submittedAt: timestamp("created_at").defaultNow().notNull(),
})

export const invitationLinksTable = pgTable("invitation_links", {
  id: serial("id").primaryKey(),
  code: uuid("code").notNull().unique(),
  maxUses: integer("max_uses").notNull(),
  usedCount: integer("used_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
})

// Type inferences for Drizzle
export type DrizzleReservation = typeof reservationsTable.$inferSelect
export type NewDrizzleReservation = typeof reservationsTable.$inferInsert
export type DrizzleInvitationLink = typeof invitationLinksTable.$inferSelect
export type NewDrizzleInvitationLink = typeof invitationLinksTable.$inferInsert

// Database functions now use proper error handling instead of silent mock fallbacks

// Create tables if they don't exist
export async function createTablesIfNotExist() {
  try {
    // Use raw SQL for table creation to ensure it works
    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        attending BOOLEAN NOT NULL DEFAULT TRUE,
        guests INTEGER NOT NULL DEFAULT 0,
        message TEXT,
        invitation_code VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
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
    console.log("Tables created or verified");
    return true;
  } catch (error) {
    console.error("Error creating tables:", error);
    return false;
  }
}

// Reservation functions
export async function getAllReservations(): Promise<Reservation[]> {
  try {
    const results = await db.select().from(reservationsTable).orderBy(reservationsTable.submittedAt);
    return results;
  } catch (error) {
    console.error("Error getting all reservations:", error);
    throw error;
  }
}

export async function getReservationById(id: number): Promise<Reservation | undefined> {
  try {
    const results = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id));
    return results[0];
  } catch (error) {
    console.error(`Error getting reservation with id ${id}:`, error);
    throw error;
  }
}

export async function addReservation(data: Omit<Reservation, "id" | "submittedAt">): Promise<Reservation> {
  console.log("Adding reservation to database:", data);
  try {
    const result = await db.insert(reservationsTable).values(data).returning();
    console.log("Successfully added reservation:", result[0]);
    return result[0];
  } catch (error) {
    console.error("Critical error adding reservation:", error);
    throw error;
  }
}

export async function updateReservation(id: number, data: Partial<Omit<Reservation, "id" | "created_at">>): Promise<Reservation | undefined> {
  try {
    const result = await db.update(reservationsTable)
      .set(data)
      .where(eq(reservationsTable.id, id))
      .returning();
    
    if (result.length === 0) return undefined;
    return result[0];
  } catch (error) {
    console.error(`Error updating reservation with id ${id}:`, error);
    throw error;
  }
}

export async function deleteReservation(id: number): Promise<boolean> {
  try {
    const result = await db.delete(reservationsTable)
      .where(eq(reservationsTable.id, id))
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error("Error deleting reservation:", error);
    throw error;
  }
}

export async function getReservationStats() {
  try {
    const allReservations = await getAllReservations();
    
    const attending = allReservations.filter((r) => r.attending).length;
    const totalGuests = allReservations.reduce((sum, r) => {
      return r.attending ? sum + r.guests + 1 : sum;
    }, 0);

    return {
      total: allReservations.length,
      attending,
      notAttending: allReservations.length - attending,
      totalGuests,
    };
  } catch (error) {
    console.error("Error getting reservation stats:", error);
    return {
      total: 0,
      attending: 0,
      notAttending: 0,
      totalGuests: 0,
    };
  }
}

// Invitation link functions
export async function createInvitationLink(
  maxUses: number,
  createdBy: string,
  expiresAt: Date | null = null,
): Promise<InvitationLink> {
  const code = generateUUID();

  try {
    console.log("Creating invitation link in database:", { maxUses, createdBy, expiresAt });

    const newLink = {
      code,
      maxUses,
      createdBy,
      expiresAt,
      isActive: true,
      usedCount: 0
    };

    const result = await db.insert(invitationLinksTable).values(newLink).returning();
    const row = result[0];

    return {
      id: row.id,
      code: row.code,
      maxUses: row.maxUses,
      usedCount: row.usedCount,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt || null,
      isActive: row.isActive,
      createdBy: row.createdBy,
    };
  } catch (error) {
    console.error("Error creating invitation link:", error);
    throw error;
  }
}

export async function getAllInvitationLinks(): Promise<InvitationLink[]> {
  try {
    console.log("Fetching all invitation links from database");

    const results = await db.select().from(invitationLinksTable).orderBy(invitationLinksTable.createdAt);
    console.log(`Found ${results.length} invitation links in database`);

    return results.map(row => ({
      id: row.id,
      code: row.code,
      maxUses: row.maxUses,
      usedCount: row.usedCount,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt || null,
      isActive: row.isActive,
      createdBy: row.createdBy,
    }));
  } catch (error) {
    console.error("Error fetching invitation links:", error);
    throw error;
  }
}

export async function getInvitationLinkByCode(code: string): Promise<InvitationLink | null> {
  try {
    console.log("Looking up invitation link by code:", code);

    const results = await db.select().from(invitationLinksTable).where(eq(invitationLinksTable.code, code));

    if (results.length === 0) {
      console.log("No invitation link found with code:", code);
      return null;
    }

    console.log("Found invitation link:", results[0]);

    const row = results[0];
    return {
      id: row.id,
      code: row.code,
      maxUses: row.maxUses,
      usedCount: row.usedCount,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt || null,
      isActive: row.isActive,
      createdBy: row.createdBy,
    };
  } catch (error) {
    console.error("Error fetching invitation link by code:", error);
    throw error;
  }
}

export async function incrementInvitationLinkUsage(code: string): Promise<boolean> {
  try {
    console.log("Incrementing usage count for invitation link:", code);

    // First, get the current link to check if it's active and hasn't reached max uses
    const linkResults = await db.select().from(invitationLinksTable).where(eq(invitationLinksTable.code, code));

    if (linkResults.length === 0) {
      console.log("No invitation link found with code:", code);
      return false;
    }

    const link = linkResults[0];

    if (!link.isActive || link.usedCount >= link.maxUses) {
      console.log("Link is inactive or has reached max uses:", {
        isActive: link.isActive,
        usedCount: link.usedCount,
        maxUses: link.maxUses,
      });
      return false;
    }

    // Calculate if link should be deactivated after increment
    const shouldDeactivate = link.usedCount + 1 >= link.maxUses;

    // Increment the used_count
    await db.update(invitationLinksTable)
      .set({ 
        usedCount: link.usedCount + 1,
        isActive: shouldDeactivate ? false : link.isActive
      })
      .where(eq(invitationLinksTable.code, code));

    console.log("Successfully incremented usage count for invitation link:", code);
    return true;
  } catch (error) {
    console.error("Error incrementing invitation link usage:", error);
    throw error;
  }
}

export async function deactivateInvitationLink(id: number): Promise<boolean> {
  try {
    console.log("Deactivating invitation link with ID:", id);
    await db.update(invitationLinksTable)
      .set({ isActive: false })
      .where(eq(invitationLinksTable.id, id));
    console.log("Successfully deactivated invitation link with ID:", id);
    return true;
  } catch (error) {
    console.error("Error deactivating invitation link:", error);
    throw error;
  }
}

export async function validateInvitationLink(code: string): Promise<{ valid: boolean; message: string }> {
  console.log("Validating invitation link with code:", code);

  try {
    const link = await getInvitationLinkByCode(code);
    console.log("Found link in database:", link);

    if (!link) {
      return { valid: false, message: "Invalid invitation code" };
    }

    if (!link.isActive) {
      return { valid: false, message: "This invitation link is no longer active" };
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return { valid: false, message: "This invitation link has expired" };
    }

    if (link.usedCount >= link.maxUses) {
      return { valid: false, message: "This invitation link has reached its maximum usage" };
    }

    return { valid: true, message: "Valid invitation link" };
  } catch (error) {
    console.error("Error validating invitation link:", error);
    return { valid: false, message: "Error validating invitation link" };
  }
}