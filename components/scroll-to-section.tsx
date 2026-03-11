"use client"

import { useEffect } from "react"

export function useScrollSpy() {
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]")
    const navLinks = document.querySelectorAll("a[href^='#']")

    const handleScroll = () => {
      let current = ""
      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.clientHeight
        if (window.scrollY >= sectionTop - 100) {
          current = section.getAttribute("id") || ""
        }
      })

      navLinks.forEach((link) => {
        link.classList.remove("text-[#d4af37]")
        link.classList.add("text-white/80")
        if (link.getAttribute("href")?.substring(1) === current) {
          link.classList.remove("text-white/80")
          link.classList.add("text-[#d4af37]")
        }
      })
    }

    window.addEventListener("scroll", handleScroll)

    // Call once on load to set initial active state
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])
}

export function ScrollToSection() {
  useScrollSpy()
  return null
}
