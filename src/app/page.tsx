"use client"
import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Shield, Lightbulb, TrendingUp, Mail, FileText, Users, Building } from "lucide-react"
import PricingSection from "@/components/PricingSection"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ChatBot from "@/components/chat-bot"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-black via-navy-darker to-navy-dark">
      <div className="relative">
        {/* Header */}
        <motion.header
          className={`fixed top-0 left-0 right-0 z-50 px-responsive py-6 transition-all duration-500 ${
            isScrolled ? "nav-solid" : "nav-transparent"
          }`}
          style={{ opacity: isScrolled ? 1 : 1 }}
        >
          <div className="max-w-8xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-electric-lime to-lime-bright rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-navy-black" />
              </div>
              <span className="text-2xl font-display">
                <span className="text-white">Blue</span>
                <span className="text-electric-lime">Licht</span>
              </span>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-12">
              <motion.a
                href="#services"
                className="text-text-secondary hover:text-white transition-all duration-300 font-medium"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Services
              </motion.a>
              <motion.a
                href="#about"
                className="text-text-secondary hover:text-white transition-all duration-300 font-medium"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                About
              </motion.a>
              <motion.a
                href="mailto:info@bluelicht.com"
                className="text-text-secondary hover:text-white transition-all duration-300 font-medium flex items-center space-x-2"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </motion.a>
            </nav>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="relative px-responsive pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="space-y-12"
            >
              <div className="space-y-8">
                <motion.h1
                  className="text-6xl md:text-8xl lg:text-9xl font-hero text-white leading-[0.9] tracking-tight"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Smart IP Protection
                  <br />
                  <span className="text-electric-lime">Made Simple</span>
                </motion.h1>

                <motion.p
                  className="text-xl md:text-2xl text-text-secondary max-w-4xl font-body leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Navigate the complex world of intellectual property with AI-powered insights, transparent pricing, and
                  expert guidance tailored for startups & SMEs.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-6 items-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/calculator">
                  <Button className="btn-primary group text-lg">
                    Calculate IP Costs
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Button className="btn-secondary text-lg">Book Consultation</Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="px-responsive py-32">
          <div className="max-w-8xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24"
            >
              <h2 className="text-5xl md:text-6xl font-hero text-white mb-8 tracking-tight">Our IP Services</h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto font-body leading-relaxed">
                Strategic, ROI-driven protection and commercialisation for high-growth founders & entrepreneurs
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="glass-panel p-12 group"
                >
                  <div className="w-16 h-16 bg-lime-glow rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <service.icon className="w-8 h-8 text-electric-lime" />
                  </div>
                  <h3 className="text-3xl font-display text-white mb-6">{service.title}</h3>
                  <p className="text-text-secondary font-body leading-relaxed mb-8 text-xl">{service.description}</p>
                  <ul className="space-y-4">
                    {service.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        className="text-text-secondary font-body flex items-start text-lg"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + idx * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-electric-lime rounded-full mr-4 mt-3 flex-shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            
            {/* Fine-print footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <p className="text-base text-text-secondary/70 font-body italic max-w-5xl mx-auto leading-relaxed whitespace-nowrap">
                *We're strategists, not a law firm. Our guidance maximises business value; when you need formal legal opinions, we coordinate with specialist counsel.*
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA Section */}
        <section className="px-responsive py-32">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-16 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-hero text-white mb-8 tracking-tight">
                Ready to Protect Your Innovation?
              </h2>
              <p className="text-xl text-text-secondary mb-12 max-w-3xl mx-auto font-body leading-relaxed">
                Get instant cost estimates for patent, trademark, and design registrations across major jurisdictions
                with our AI-powered calculator.
              </p>
              <Link href="/calculator">
                <Button className="btn-primary text-xl px-12 py-6">
                  Start Cost Calculator
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <ChatBot />
    </div>
  )
}

const services = [
  {
    title: "Patent & Design Protection",
    icon: FileText,
    description:
      "Secure your core tech while keeping burn low.",
    features: [
      "Utility & design filing road-map tailored to your product launch cadence",
      "Transparent fee tables + jurisdiction-by-jurisdiction cost forecasts",
      "Portfolio pruning & renewal strategy to cut dead-weight patents",
      "[Coming soon] ROI dashboard to show investors intangible asset value",
    ],
  },
  {
    title: "Brand & Trade-Secret Shield",
    icon: Shield,
    description:
      "Lock down the intangibles that make you memorable.",
    features: [
      "Clearance search + risk matrix for names, logos, slogans in key markets",
      "Tiered trademark filing bundles (ASEAN │ EU │ US) with budget caps",
      "Trade-secret frameworks (NDAs, access controls, employee exit check-lists)",
      "Rapid takedown / enforcement playbook for marketplace infringements",
      "[Coming soon] Brand-asset monitoring bot (alerts when look-alikes pop up online)",
    ],
  },
  {
    title: "Fractional Chief Innovation Officer",
    icon: Users,
    description:
      "Independent IP strategy without the full-time exec price tag.",
    features: [
      "360° IP audit → valuation model aligned to upcoming funding round",
      "Grant navigation (SG │ EU │ US) with probability-weighted ROI estimates",
      "Licensing & spin-out strategy to open new revenue streams",
      "Investor-grade IP narrative for your pitch deck",
      "Team workshops: \"IP 101 for engineers & marketers\" (2-hr live or async)",
    ],
  },
]
