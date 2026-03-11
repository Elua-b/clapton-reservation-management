import { z } from "zod"

export const rsvpFormSchema = z.object({
  name: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  attending: z.enum(["yes", "no"]),
  guests: z.number().min(0).max(5),
  message: z.string().optional(),
  invitationCode: z.string().optional(),
})
