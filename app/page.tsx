"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Heart, MapPin, Send, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"
import { z } from "zod"
import { ScrollToSection } from "@/components/scroll-to-section"
import { rsvpFormSchema } from "@/lib/schema"

type RsvpFormData = z.infer<typeof rsvpFormSchema>

export default function Home() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<RsvpFormData>>({
    attending: "yes",
    guests: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [invitationCode, setInvitationCode] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)

    // Check if there's an invitation code in session storage
    const storedCode = sessionStorage.getItem("invitationCode")
    if (storedCode) {
      setInvitationCode(storedCode)
    }

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    console.log("Form data:", formData)

    try {
      // Add invitation code to form data if available
      const formDataWithInvitation = invitationCode ? { ...formData, invitationCode } : formData

      // Validate form data
      const validatedData = rsvpFormSchema.parse(formDataWithInvitation)

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

      // Reset form
      setFormData({
        attending: "yes",
        guests: 0,
      })
      setShowForm(false)
      setShowSuccess(true)

      // Clear invitation code from session storage after successful submission
      if (invitationCode) {
        sessionStorage.removeItem("invitationCode")
        setInvitationCode(null)
      }
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
        toast({
          title: "Form Incomplete",
          description: "Please fill in all required fields highlighted in red.",
          variant: "destructive",
        })
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
    <main className="flex min-h-screen flex-col bg-wedding-cream text-wedding-charcoal">
      <ScrollToSection />
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
        <Image src="/images/2H6A9775.jpg" alt="Adonis and Kathia" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl">
          <motion.p
            className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-white font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            We are getting married
          </motion.p>
          
          <motion.h1
            className="text-4xl md:text-7xl lg:text-9xl font-cormorant mb-6 text-white italic px-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Emmanuel & Jackline
          </motion.h1>

          <div className="w-24 h-px bg-white/50 mb-8"></div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-xs md:text-sm tracking-[0.5em] uppercase text-white font-light">
              Save the Date
            </p>
            <h2 className="text-2xl md:text-4xl font-cormorant text-white">
              April 4, 2026
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12"
          >
            <Button
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-8 py-6 text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded-none"
              onClick={() => setShowForm(true)}
            >
              RSVP Now
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/80 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          onClick={() => {
            const nextSection = document.getElementById("our-story");
            nextSection?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <ChevronDown className="w-8 h-8 font-light" />
        </motion.div>
      </section>

      {/* Quote Section */}
      <section className="py-20 md:py-32 bg-wedding-sage/5 border-y border-wedding-sage/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <div className="text-wedding-sage/20 text-6xl md:text-8xl font-serif leading-none mb-4 md:mb-8 italic opacity-50">“</div>
           <h2 className="text-2xl md:text-4xl font-cormorant text-wedding-charcoal mb-6 leading-relaxed md:leading-tight px-4 md:px-0">
             House and riches are the inheritance of fathers <br className="hidden md:block" /> and a prudent wife is from the Lord
           </h2>
           <p className="text-[10px] md:text-sm tracking-[0.3em] uppercase text-wedding-sage/60 font-medium">Proverbs 19:14</p>
           <div className="text-wedding-sage/20 text-6xl md:text-8xl font-serif leading-none mt-4 md:mt-8 italic opacity-50">”</div>
        </div>
      </section>

      {/* Event Attractions */}
      <section id="our-wedding" className="py-32 px-4 md:px-8 bg-wedding-cream relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-4"
            >
              <div className="text-wedding-sage/60">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4.5 9c0 0 2 1 2 3s-2 3-2 3l7.5 7 7.5-7s-2-1-2-3 2-3 2-3L12 2z" />
                </svg>
              </div>
            </motion.div>
            <motion.h2
              className="text-4xl font-cormorant mb-4 text-wedding-charcoal"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Event Attractions
            </motion.h2>
            <p className="text-wedding-charcoal/60 max-w-2xl mx-auto font-light leading-relaxed">
              We've prepared some special details to make our day even more memorable. From the ceremony to the celebration, here is what you can expect.
            </p>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-16 gap-x-8 md:gap-x-12 px-6 md:px-0">
            {/* Introduction */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-wedding-sage/60" />
              </div>
              <h3 className="text-xl font-cormorant text-wedding-charcoal">Introduction</h3>
              <p className="text-wedding-charcoal/60 text-sm leading-relaxed">
                April 4, 2026 at 09:00 AM <br />
                Rwempasha (Gasinga)
              </p>
            </motion.div>
 
            {/* Wedding Ceremony */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-wedding-terracotta/60" />
              </div>
              <h3 className="text-xl font-cormorant text-wedding-charcoal">Wedding Ceremony</h3>
              <p className="text-wedding-charcoal/60 text-sm leading-relaxed">
                April 4, 2026 at 02:00 PM <br />
                Gasinga Miracle Center
              </p>
            </motion.div>
 
            {/* Celebration */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-wedding-terracotta/60" />
              </div>
              <h3 className="text-xl font-cormorant text-wedding-charcoal">Celebration</h3>
              <p className="text-wedding-charcoal/60 text-sm leading-relaxed">
                 Dinner & Dancing <br />
                 Join us as we celebrate!
              </p>
            </motion.div>

            {/* Documentation - placeholder */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-wedding-terracotta/60">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                 </svg>
              </div>
              <h3 className="text-xl font-cormorant text-wedding-charcoal">Documentation</h3>
              <p className="text-wedding-charcoal/60 text-sm leading-relaxed">
                 Capturing every beautiful moment of our special day.
              </p>
            </motion.div>

            {/* Food & Drinks - placeholder */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-wedding-terracotta/60">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7l-4 4v7h14v-7l-4-4h-3V7a2 2 0 0 1 2-2h3V2z" />
                 </svg>
              </div>
              <h3 className="text-xl font-cormorant text-wedding-charcoal">Food & Drinks</h3>
              <p className="text-wedding-charcoal/60 text-sm leading-relaxed">
                 A curated menu of fine dining and signature cocktails.
              </p>
            </motion.div>

             {/* Accommodation - placeholder */}
             <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-wedding-terracotta/60">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                 </svg>
              </div>
              <h3 className="text-xl font-cormorant text-wedding-charcoal">Accommodation</h3>
              <p className="text-wedding-charcoal/60 text-sm leading-relaxed">
                 Special rates for our guests at the Sunset Beach Resort.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="py-32 px-4 md:px-8 bg-wedding-beige overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-4"
            >
              <div className="text-wedding-terracotta/60">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4.5 9c0 0 2 1 2 3s-2 3-2 3l7.5 7 7.5-7s-2-1-2-3 2-3 2-3L12 2z" />
                </svg>
              </div>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-cormorant mb-6 text-wedding-charcoal"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our Story
            </motion.h2>
            <motion.div
              className="max-w-3xl mx-auto space-y-6 text-wedding-charcoal/70 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <p className="italic">
                "Our journey didn't begin with riches, but with a wealth of faith and a shared vision. When we first met eight years ago, Clapton was building his dreams from the ground up, with nothing but ambition in his heart. In those early years of struggle, Jackline saw what the rest of the world hadn't yet discovered. She believed in him when he had nothing, standing by his side and supporting every endeavor with unwavering devotion."
              </p>
              
              <motion.div 
                className="relative h-64 md:h-96 w-full max-w-2xl mx-auto my-12 overflow-hidden rounded-xl shadow-lg border-4 border-white"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Image 
                  src="/images/2H6A0205.jpg" 
                  alt="Special Moment" 
                  fill 
                  className="object-cover"
                />
              </motion.div>

              <p>
                Together, we weathered every storm and celebrated every sunrise. We grew side-by-side, turning a simple promise into a beautiful reality of happiness and success. Today, after eight years of walking hand-in-hand, we are blessed with a home filled with the laughter of our three beautiful children—our daughter and two sons. We stand here today to celebrate our love with those who mean the most to us, a testimony to a love that grows stronger with every passing year.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 items-center relative px-6 md:px-0">
            {/* Left: Sally */}
            <motion.div
              className="text-center md:text-right space-y-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-cormorant text-wedding-charcoal">Mutoni Jackline (Mankazi)</h3>
              <p className="text-wedding-charcoal/70 leading-relaxed font-light">
                Daughter of Pastor Frank NTAMBARA.
              </p>
              <div className="flex justify-center md:justify-end gap-3 text-wedding-sage/40">
                 {/* Social links placeholders - keeping subtle */}
                 <span className="w-8 h-8 rounded-full border border-wedding-sage/10 flex items-center justify-center text-[10px] tracking-tighter">IG</span>
                 <span className="w-8 h-8 rounded-full border border-wedding-sage/10 flex items-center justify-center text-[10px] tracking-tighter">FB</span>
                 <span className="w-8 h-8 rounded-full border border-wedding-sage/10 flex items-center justify-center text-[10px] tracking-tighter">TW</span>
              </div>
            </motion.div>

            {/* Middle: Image & Ampersand */}
            <div className="relative flex justify-center items-center py-12">
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
                <span className="text-[12rem] md:text-[20rem] font-serif transition-all duration-700">&</span>
             </div>
               <motion.div
                 className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white shadow-xl z-10"
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1 }}
               >
                 <Image src="/images/2H6A9706.jpg" alt="The Couple" fill className="object-cover" />
               </motion.div>
               <div className="absolute -bottom-6 right-1/4 md:right-0 z-20 hidden md:block">
                  <span className="text-6xl md:text-8xl font-serif text-wedding-terracotta/10">&</span>
               </div>
            </div>

            {/* Right: Adonis */}
            <motion.div
              className="text-center md:text-left space-y-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-cormorant text-wedding-charcoal">Mugisha Emmanuel (Clapton)</h3>
              <p className="text-wedding-charcoal/70 leading-relaxed font-light">
                Son of Pastor Augustin GAKERI.
              </p>
              <div className="flex justify-center md:justify-start gap-4 text-wedding-sage/60">
                 {/* Social links placeholders */}
                 <span className="w-8 h-8 rounded-full border border-wedding-sage/20 flex items-center justify-center text-xs">f</span>
                 <span className="w-8 h-8 rounded-full border border-wedding-sage/20 flex items-center justify-center text-xs">t</span>
                 <span className="w-8 h-8 rounded-full border border-wedding-sage/20 flex items-center justify-center text-xs">i</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-32 px-4 md:px-8 bg-wedding-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-4"
            >
              <div className="text-wedding-sage/60">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4.5 9c0 0 2 1 2 3s-2 3-2 3l7.5 7 7.5-7s-2-1-2-3 2-3 2-3L12 2z" />
                </svg>
              </div>
            </motion.div>
            <motion.h2
              className="text-4xl font-cormorant mb-4 text-wedding-charcoal"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Moments Captured
            </motion.h2>
            <p className="text-wedding-charcoal/60 max-w-2xl mx-auto font-light leading-relaxed">
              A glimpse into our journey together and the beautiful path that led us here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
            {[
              "/images/2H6A9733.jpg",
              "/images/2H6A9749.jpg",
              "/images/2H6A9775.jpg",
              "/images/2H6A9792.jpg",
              "/images/2H6A9798.jpg",
              "/images/2H6A9832.jpg",
              "/images/2H6A9834.jpg",
              "/images/2H6A9875.jpg",
              "/images/2H6A0205.jpg",
              "/images/2H6A9885.jpg",
            ].map((src, index) => (
              <motion.div
                key={index}
                className="aspect-[3/4] relative overflow-hidden group shadow-sm bg-white"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Image
                  src={src || "/placeholder.svg"}
                  alt={`Adonis and Kathia ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-wedding-sage/0 group-hover:bg-wedding-sage/10 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP CTA */}
      <section id="rsvp" className="py-32 px-4 md:px-8 bg-wedding-warmBeige/20 relative border-t border-wedding-terracotta/5">
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-wedding-sage/60" />
            </div>
            <h2 className="text-3xl md:text-5xl font-cormorant mb-8 text-wedding-charcoal italic px-4 md:px-0">Join Us On Our Special Day</h2>
            <p className="text-base md:text-lg mb-6 text-wedding-charcoal/70 font-light leading-relaxed px-4 md:px-0">
              We're excited to celebrate our love with you. Please let us know if you'll be able to join us by March 20th.
            </p>
            <div className="mb-12 space-y-3 text-wedding-sage/80 font-cormorant text-lg md:text-xl px-4 md:px-0">
            <div className="mb-12 space-y-3 text-wedding-sage/80 font-cormorant text-lg md:text-xl px-4 md:px-0">
              <div className="flex flex-col md:flex-row justify-center gap-x-8 gap-y-2">
                <p>Jackline: <a href="tel:0788256046" className="hover:text-wedding-gold transition-colors">0788256046</a></p>
                <p>Emmanuel: <a href="tel:0788256046" className="hover:text-wedding-gold transition-colors">0788256046</a></p>
              </div>
              <div className="flex flex-col md:flex-row justify-center gap-x-8 gap-y-2">
                <p>Nshaija: <a href="tel:0788360985" className="hover:text-wedding-gold transition-colors">0788360985</a></p>
                <p>Rodgers: <a href="tel:0783052085" className="hover:text-wedding-gold transition-colors">0783052085</a></p>
              </div>
              <div className="flex flex-col md:flex-row justify-center gap-x-8 gap-y-2">
                <p>Kansime: <a href="tel:0728592991" className="hover:text-wedding-gold transition-colors">0728592991</a></p>
                <p>Reagan: <a href="tel:0785469975" className="hover:text-wedding-gold transition-colors">0785469975</a></p>
              </div>
            </div>
            </div>
            <Button
              size="lg"
              className="bg-wedding-sage text-white hover:bg-wedding-sage/90 px-12 py-7 text-sm tracking-[0.2em] uppercase transition-all duration-300 rounded-none shadow-lg"
              onClick={() => setShowForm(true)}
            >
              RSVP Now
            </Button>

            {invitationCode && (
              <div className="mt-8 text-xs tracking-widest text-wedding-sage/60 uppercase">
                Reservation Code: {invitationCode.substring(0, 8)}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* RSVP Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-wedding-charcoal/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-wedding-cream p-6 md:p-12 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-wedding-sage/10 shadow-2xl relative scrollbar-hide"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-wedding-charcoal/40 hover:text-wedding-charcoal hover:bg-transparent"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </Button>

              <div className="text-center mb-8 md:mb-10 mt-4 md:mt-0">
                <h2 className="text-2xl md:text-4xl font-cormorant text-wedding-charcoal italic mb-2">RSVP</h2>
                <div className="w-12 h-px bg-wedding-sage/30 mx-auto"></div>
              </div>

              {invitationCode && (
                <div className="mb-8 p-4 bg-wedding-sage/10 border border-wedding-sage/10 text-center">
                  <p className="text-xs tracking-[0.2em] uppercase text-wedding-sage/70">
                    Invitation Code: <span className="font-medium">{invitationCode.substring(0, 8)}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className={`bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12 ${errors.name ? "border-red-400" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className={`bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12 ${errors.email ? "border-red-400" : ""}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      className={`bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12 ${errors.phone ? "border-red-400" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Home Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className={`bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12 ${errors.address ? "border-red-400" : ""}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="attending" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Will you attend?</Label>
                    <select
                      id="attending"
                      name="attending"
                      value={formData.attending}
                      onChange={handleChange}
                      className="flex h-12 w-full bg-white/50 border border-wedding-sage/10 border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wedding-sage/20 rounded-none"
                    >
                      <option value="yes">Yes, I will attend</option>
                      <option value="no">No, I cannot attend</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Guest Count</Label>
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min="0"
                      max="5"
                      value={formData.guests}
                      onChange={handleChange}
                      disabled={formData.attending === "no"}
                      className="bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Dietary requirements or well wishes..."
                    className="bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-wedding-charcoal text-white hover:bg-wedding-charcoal/90 h-14 text-sm tracking-[0.2em] uppercase rounded-none transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Confirm Attendance"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 md:py-16 px-4 bg-wedding-cream text-wedding-charcoal/40 text-center text-[10px] md:text-xs tracking-[0.3em] uppercase border-t border-wedding-sage/10">
        <div className="max-w-6xl mx-auto">
          <p>© {new Date().getFullYear()} Emmanuel & Jackline <span className="mx-2 md:mx-4">•</span> All Rights Reserved</p>
          <p className="mt-4 tracking-[0.2em] font-medium text-wedding-gold/60">
            DEVELOPED & DESIGNED BY <span className="text-wedding-gold">Eloi BUGINGO</span> 0788420127
          </p>
          <div className="mt-8 flex justify-center items-center opacity-40">
            <Link
              href="/admin"
              className="hover:text-wedding-terracotta transition-colors duration-300 border-b border-transparent hover:border-wedding-terracotta/20 pb-1"
            >
              Admin Access
            </Link>
          </div>
        </div>
      </footer>

      {/* Success Message Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 bg-wedding-charcoal/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-wedding-cream p-12 max-w-lg w-full text-center border border-wedding-gold/20 shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-wedding-sage/10 flex items-center justify-center mx-auto mb-8">
                <Heart className="w-10 h-10 text-wedding-gold" />
              </div>
              <h2 className="text-3xl font-cormorant text-wedding-charcoal mb-4 italic">Thank You!</h2>
              <p className="text-wedding-charcoal/70 mb-8 font-light leading-relaxed">
                Your RSVP has been received with love. We are so grateful to have you join us on this beautiful journey.
              </p>
              <Button
                variant="outline"
                className="border-wedding-sage/30 text-wedding-sage hover:bg-wedding-sage/5 px-8 py-6 rounded-none tracking-widest uppercase text-xs"
                onClick={() => setShowSuccess(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 
      <Toaster />
    </main>
  )
}
