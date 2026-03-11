"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { z } from "zod"
import { rsvpFormSchema } from "@/lib/schema"

type RsvpFormData = z.infer<typeof rsvpFormSchema>

export default function RsvpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<RsvpFormData>>({
    attending: "yes",
    guests: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "guests") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = rsvpFormSchema.parse(formData)

      // Send data to API
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit RSVP")
      }

      // Show success message
      toast({
        title: "RSVP Submitted!",
        description: "Thank you for your response. We look forward to celebrating with you!",
      })

      // Reset form or redirect
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-cormorant text-white mb-4">RSVP</h1>
            <p className="text-white/80">Please let us know if you'll be joining us on our special day.</p>
          </div>

          <div className="bg-neutral-900 rounded-lg p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="address" className="text-white">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    className={errors.address ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attending" className="text-white">
                      Will you attend?
                    </Label>
                    <select
                      id="attending"
                      name="attending"
                      value={formData.attending}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="yes">Yes, I will attend</option>
                      <option value="no">No, I cannot attend</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="guests" className="text-white">
                      Number of Additional Guests
                    </Label>
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min="0"
                      max="5"
                      value={formData.guests}
                      onChange={handleChange}
                      disabled={formData.attending === "no"}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any dietary restrictions or special notes?"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit RSVP"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Toaster />
    </main>
  )
}
