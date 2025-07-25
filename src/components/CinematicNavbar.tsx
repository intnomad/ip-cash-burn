'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'

export default function CinematicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'navbar-solid' : 'navbar-transparent'
    }`}>
      <div className="container-cinematic">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Shield className="h-8 w-8 text-electric-lime transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-electric-lime opacity-20 blur-sm scale-150 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-primary tracking-tight">
              Blue<span className="text-electric-lime">Licht</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              href="#services" 
              className="text-secondary hover:text-electric-lime transition-colors duration-300 font-medium tracking-wide"
            >
              Services
            </Link>
            <Link 
              href="#calculator" 
              className="text-secondary hover:text-electric-lime transition-colors duration-300 font-medium tracking-wide"
            >
              Calculator
            </Link>
            <Link 
              href="#pricing" 
              className="text-secondary hover:text-electric-lime transition-colors duration-300 font-medium tracking-wide"
            >
              Pricing
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-primary inline-flex items-center"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-primary hover:text-electric-lime transition-colors duration-300"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mobile-menu-overlay z-40">
            <div className="container-cinematic py-8 space-y-6">
              <Link 
                href="#services" 
                className="block text-secondary hover:text-electric-lime transition-colors duration-300 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="#calculator" 
                className="block text-secondary hover:text-electric-lime transition-colors duration-300 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Calculator
              </Link>
              <Link 
                href="#pricing" 
                className="block text-secondary hover:text-electric-lime transition-colors duration-300 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4">
                <Link 
                  href="/dashboard" 
                  className="btn-primary inline-flex items-center w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 