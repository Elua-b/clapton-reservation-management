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
import { ScrollToSection } from "@/components/scroll-to-section"
import { z } from "zod"
import { rsvpFormSchema } from "@/lib/schema"

export default function Home() {
  const { toast } = useToast()
  const [scrollY, setScrollY] = useState(0)
  const [formData, setFormData] = useState<Partial<z.infer<typeof rsvpFormSchema>>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const validatedData = rsvpFormSchema.parse(formData)
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) throw new Error("Failed to send wish")

      toast({ title: "Wish Sent!", description: "Thank you for your beautiful message!" })
      setFormData({})
      setShowForm(false)
      setShowSuccess(true)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
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
            Clapton & Jacky
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
              Send your wish
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 px-6 md:px-0">
            {/* Introduction */}
            <motion.div
              className="text-center space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="w-10 h-10 text-wedding-sage/60 mx-auto mb-2" />
              <h3 className="text-lg font-cormorant text-wedding-charcoal">Introduction</h3>
              <p className="text-wedding-charcoal/60 text-xs">
                09:00 AM <br /> Rwempasha(Gasinga)
              </p>
            </motion.div>
 
            {/* Wedding Ceremony */}
            <motion.div
              className="text-center space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <MapPin className="w-10 h-10 text-wedding-terracotta/60 mx-auto mb-2" />
              <h3 className="text-lg font-cormorant text-wedding-charcoal">Religious</h3>
              <p className="text-wedding-charcoal/60 text-xs"> 02:00 PM <br /> Miracle Center
              </p>
            </motion.div>
 
            {/* Celebration */}
            <motion.div
              className="text-center space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Heart className="w-10 h-10 text-wedding-terracotta/60 mx-auto mb-2" />
              <h3 className="text-lg font-cormorant text-wedding-charcoal">Reception</h3>
              <p className="text-wedding-charcoal/60 text-xs">04:00 PM <br />Sun flower</p>
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
              className="max-w-2xl mx-auto space-y-4 text-wedding-charcoal/70 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <p className="">
                Clapton and Jacky’s love story began in 2015. What started as a simple connection soon grew into a deep and beautiful love.
 
In 2018, they sealed their commitment through a civil marriage, marking the beginning of a stronger journey together.
 
Since then, their love has continued to grow deeper and stronger, proving that true love only gets better with time. ❤️
              </p>
              
              <motion.div 
                className="relative h-64 md:h-80 w-full max-w-xl mx-auto my-10 overflow-hidden rounded-xl shadow-lg border-4 border-white"
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
            Today they are  blessed with three wonderful children, They celebrate a love that only grows stronger with time. Welcome to a story of devotion, growth, and the beautiful reality they have built together.
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
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto md:ml-auto mb-6">
                <Image src="/images/2H6A0220.jpg" alt="Mutoni Jackline" fill className="object-cover" />
              </div>
              <h3 className="text-3xl font-cormorant text-wedding-charcoal">Mutoni Jackline (Mankazi)</h3>
              <p className="text-wedding-charcoal/70 leading-relaxed font-light">
                Daughter of Pastor Frank NTAMBARA.
              </p>
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
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto md:mr-auto mb-6">
                <Image src="/images/2H6A9875.jpg" alt="Mugisha Emmanuel" fill className="object-cover" />
              </div>
              <h3 className="text-3xl font-cormorant text-wedding-charcoal">Mugisha Emmanuel (Clapton)</h3>
              <p className="text-wedding-charcoal/70 leading-relaxed font-light">
                Son of Pastor Augustin GAKERI.
              </p>
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
          
           
              "/images/2H6A9775.jpg",

              "/images/2H6A9798.jpg",
              // "/images/2H6A9832.jpg",
              // "/images/2H6A9834.jpg",
              // "/images/2H6A9875.jpg",
              "/images/2H6A0205.jpg",

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

      {/* Wish CTA */}
      <section id="wish" className="py-32 px-4 md:px-8 bg-wedding-warmBeige/20 relative border-t border-wedding-terracotta/5">
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
            <h2 className="text-3xl md:text-5xl font-cormorant mb-8 text-wedding-charcoal italic px-4 md:px-0">Send Your Wish</h2>
            <p className="text-base md:text-lg mb-12 text-wedding-charcoal/70 font-light leading-relaxed px-4 md:px-0">
              We're excited to celebrate our love with you. Your well wishes mean the world to us!
            </p>
            <Button
              size="lg"
              className="bg-wedding-sage text-white hover:bg-wedding-sage/90 px-12 py-7 text-sm tracking-[0.2em] uppercase transition-all duration-300 rounded-none shadow-lg"
              onClick={() => setShowForm(true)}
            >
              Send Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Wish Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-wedding-charcoal/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-wedding-cream p-6 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-wedding-sage/10 shadow-2xl relative scrollbar-hide"
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
                <h2 className="text-2xl md:text-4xl font-cormorant text-wedding-charcoal italic mb-2">Send Your Wish</h2>
                <div className="w-12 h-px bg-wedding-sage/30 mx-auto"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className={`bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12 ${errors.name ? "border-red-400" : ""}`}
                  />
                  {errors.name && <p className="text-red-400 text-[10px] uppercase tracking-tighter">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs uppercase tracking-widest text-wedding-charcoal/60">Your Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message || ""}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Write your beautiful message here..."
                    className={`bg-white/50 border-wedding-sage/10 focus:border-wedding-sage/30 rounded-none ${errors.message ? "border-red-400" : ""}`}
                  />
                  {errors.message && <p className="text-red-400 text-[10px] uppercase tracking-tighter">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-wedding-charcoal text-white hover:bg-wedding-charcoal/90 h-14 text-sm tracking-[0.2em] uppercase rounded-none transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Wish"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 md:py-16 px-4 bg-wedding-cream text-wedding-charcoal/40 text-center text-[10px] md:text-xs tracking-[0.3em] uppercase border-t border-wedding-sage/10">
        <div className="max-w-6xl mx-auto">
          <p>© {new Date().getFullYear()} Clapton & Jacky <span className="mx-2 md:mx-4">•</span> All Rights Reserved</p>
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
              <h2 className="text-3xl font-cormorant text-wedding-charcoal mb-4 italic">Wish Sent!</h2>
              <p className="text-wedding-charcoal/70 mb-8 font-light leading-relaxed">
                Thank you for your beautiful message. We are so grateful to have your love and support.
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
