"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Update the navLinks array to use section IDs instead of page URLs
  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#our-wedding", label: "Our Wedding" },
    { href: "#our-story", label: "Our Story" },
    { href: "#gallery", label: "Gallery" },
    { href: "#rsvp", label: "RSVP" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-wedding-cream/90 backdrop-blur-md py-3 shadow-sm border-b border-wedding-sage/10" : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className={cn(
          "font-cormorant text-2xl tracking-widest italic transition-colors duration-500",
          !isScrolled && pathname === "/" ? "text-white" : "text-wedding-charcoal"
        )}>
          <span className="text-wedding-gold">E</span> & <span className="text-wedding-gold">J</span>
        </Link>
 
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors relative group",
                !isScrolled && pathname === "/" ? "text-white/80 hover:text-white" : "text-wedding-charcoal/60 hover:text-wedding-sage"
              )}
              onClick={(e) => {
                e.preventDefault()
                const element = document.querySelector(link.href)
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" })
                }
                closeMenu()
              }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-wedding-gold transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>
 
        <button className="md:hidden p-2" onClick={toggleMenu} aria-label={isOpen ? "Close menu" : "Open menu"}>
          {isOpen ? <X className="h-6 w-6 text-wedding-sage" /> : <Menu className={cn("h-6 w-6 transition-colors duration-500", !isScrolled && pathname === "/" ? "text-white" : "text-wedding-sage")} />}
        </button>
      </div>
 
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-wedding-beige z-40 md:hidden pt-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center space-y-10 p-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm uppercase tracking-[0.3em] text-wedding-charcoal/70 hover:text-wedding-terracotta transition-colors",
                      pathname === "/" && link.href === "#home" ? "text-wedding-terracotta" : "",
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector(link.href)
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" })
                      }
                      closeMenu()
                    }}
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
