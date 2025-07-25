import { useState } from "react"
import { motion } from "framer-motion"
import { X, CreditCard, Check, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

const plans = [
  {
    id: "foundation",
    name: "IP Foundation",
    price: 2500,
    currency: "$",
    bestFor: "Pre-Seed → Seed (≤ US $1 M raised)",
    features: [
      "90-min strategy call",
      "3-year IP roadmap + cost-benefit analysis",
      "Grant opportunities (≥ US $10 k potential)",
    ],
  },
  {
    id: "growth",
    name: "IP Growth Strategy",
    price: 6500,
    currency: "$",
    popular: true,
    bestFor: "Series A (US $1–10 M raised)",
    features: [
      "Everything in Foundation",
      "Investor-ready IP valuation report",
      "Competitive IP landscape analysis",
    ],
  },
  {
    id: "excellence",
    name: "IP Excellence",
    price: 15000,
    currency: "$",
    bestFor: "Series B+ / IP-heavy companies",
    features: [
      "Everything in Growth Strategy",
      "Board-ready IP presentation",
      "IP portfolio optimisation",
    ],
  },
]

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("pro")

  const handlePayment = (planId: string) => {
    // Demo payment processing
    // For demo purposes, just show success
    alert("Demo mode - payment processing would be implemented here")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">A Clear Strategy for Every Stage</h2>
            <p className="text-white/70">Choose the perfect IP consulting package for your business stage</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 text-text-secondary" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative ${plan.popular ? 'pt-10' : 'pt-6'} p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? "border-electric-lime bg-lime-glow"
                  : "border-border-subtle bg-surface-glass hover:border-electric-lime/50"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-electric-lime text-navy-black px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-electric-lime mb-2">
                  {plan.currency}{plan.price.toLocaleString()}
                </div>
                <p className="text-white/60 text-sm">Best for: {plan.bestFor}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(plan.id)}
                className={`w-full ${selectedPlan === plan.id ? "btn-primary" : "btn-secondary"}`}
              >
                {plan.id === "board-pack" ? (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Book a Consultation
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-surface-glass rounded-lg border border-border-subtle">
          <h3 className="text-white font-semibold mb-2">Secure Payment</h3>
          <p className="text-text-secondary text-sm">
            All payments are processed securely. Your card information is encrypted and never stored on
            our servers.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
