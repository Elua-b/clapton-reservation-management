import { z } from "zod"

export const rsvpFormSchema = z.object({
  name: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  attending: z.enum(["yes", "no"]).optional(),
  guests: z.number().min(0).max(5).optional(),
  message: z.string().min(1, { message: "Message is required" }),
  invitationCode: z.string().optional(),
})
