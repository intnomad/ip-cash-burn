'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Shield, TrendingUp, Users } from 'lucide-react';

// FX state management
interface FXState {
  fx: Record<string, number> | null;
  fxFetched: number | null;
  currency: string;
}

const state: FXState = {
  fx: null,
  fxFetched: null,
  currency: 'SGD'
};

// Live-FX helper — cache for 1 h
async function getRates(base = "USD") {
  const ONE_H = 60 * 60 * 1_000;
  if (!state.fx || (state.fxFetched && Date.now() - state.fxFetched > ONE_H)) {
    try {
      const res = await fetch(
        `https://api.exchangerate.host/latest?base=${base}&symbols=USD,SGD,EUR`
      );
      const data = await res.json();
      state.fx = data.rates;   // e.g. { USD:1, SGD:1.35, EUR:0.91 }
      state.fxFetched = Date.now();
    } catch (error) {
      console.error('FX rate fetch failed:', error);
      // Fallback rates
      state.fx = { USD: 1, SGD: 1.35, EUR: 0.91 };
      state.fxFetched = Date.now();
    }
  }
  return state.fx;
}

async function formatCurrency(amountUSD: number) {
  const cur = state.currency || "SGD";
  const rates = await getRates();
  const rate = rates?.[cur] ?? 1;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(amountUSD * rate);
}

const pricingTiers = [
  {
    id: 'foundation',
    name: 'IP Foundation',
    description: 'Pre-Seed → Seed (≤ US $1 M raised)',
    priceUSD: 2500,
    features: [
      '90-min strategy call',
      '3-year IP roadmap + cost-benefit analysis',
      'Grant opportunities (≥ US $10 k potential)',
      'Referral to pre-vetted lawyers + briefing doc'
    ],
    cta: 'Start My IP Health Check',
    popular: false
  },
  {
    id: 'growth',
    name: 'IP Growth Strategy',
    description: 'Series A (US $1–10 M raised)',
    priceUSD: 6500,
    features: [
      'Everything in Foundation',
      'Investor-ready IP valuation report',
      'Competitive IP landscape analysis',
      'Licensing strategy & revenue projections',
      'Due-diligence preparation package',
      '90-min founder + team training session',
      '6-month implementation roadmap'
    ],
    cta: 'Get Investor-Ready',
    popular: true
  },
  {
    id: 'excellence',
    name: 'IP Excellence',
    description: 'Series B+ / IP-heavy companies',
    priceUSD: 15000,
    features: [
      'Everything in Growth Strategy',
      'Board-ready IP presentation',
      'IP portfolio optimisation (keep / abandon)',
      'M&A preparation IP package',
      'Quarterly strategic reviews',
      'Team IP training program',
      'Direct lawyer / accountant coordination'
    ],
    cta: 'Book Executive Briefing',
    popular: false
  }
];

export default function PricingSection() {
  const [formattedPrices, setFormattedPrices] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updatePrices = async () => {
      setIsLoading(true);
      const prices: Record<string, string> = {};
      
      for (const tier of pricingTiers) {
        prices[tier.id] = await formatCurrency(tier.priceUSD);
      }
      
      setFormattedPrices(prices);
      setIsLoading(false);
    };

    updatePrices();
  }, [state.currency]);

  const handleCurrencyChange = async (currency: string) => {
    state.currency = currency;
    const prices: Record<string, string> = {};
    
    for (const tier of pricingTiers) {
      prices[tier.id] = await formatCurrency(tier.priceUSD);
    }
    
    setFormattedPrices(prices);
  };

  return (
    <section id="pricing" className="px-responsive py-32">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-electric-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-electric-lime" />
          </div>
          <h2 className="text-5xl md:text-6xl font-hero text-white mb-8 tracking-tight">
            Ready to save up to <span className="text-electric-lime">$31,550</span> on your IP journey?
          </h2>
          <p className="text-xl text-text-secondary max-w-4xl mx-auto font-body leading-relaxed mb-6">
            Unlock a personalized strategy report revealing cash-saving tactics, grant matches, and industry benchmarks—built for founders and SMEs. Instantly see how to optimize filings and avoid hidden legal/admin costs.
          </p>
          <p className="text-text-secondary/70 font-body italic text-base">
            *Not legal advice, but proven to help founders save big before talking to a lawyer.*
          </p>
        </motion.div>

        {/* Currency Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center gap-3 mb-12"
        >
          {["SGD", "USD", "EUR"].map((currency) => (
            <button
              key={currency}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currency === state.currency
                  ? "bg-electric-lime text-navy-black shadow-lg"
                  : "bg-surface-glass text-text-secondary hover:text-white border border-border-subtle hover:border-electric-lime/50"
              }`}
              onClick={() => handleCurrencyChange(currency)}
            >
              {currency}
            </button>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`relative p-8 rounded-2xl shadow-xl flex flex-col ${
                tier.popular
                  ? "border-4 border-electric-lime bg-lime-glow"
                  : "border-2 border-border-subtle bg-surface-glass"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-electric-lime text-navy-black px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-semibold text-white mb-1">{tier.name}</h3>
              <p className="text-sm italic mb-4 text-text-secondary">{tier.description}</p>
              
              <div className="text-4xl font-bold mb-4 text-electric-lime">
                {isLoading ? (
                  <div className="w-24 h-12 bg-electric-lime/20 rounded animate-pulse"></div>
                ) : (
                  formattedPrices[tier.id] || `$${tier.priceUSD.toLocaleString()}`
                )}
              </div>

              <ul className="list-disc list-inside space-y-2 mb-6 flex-1 text-text-secondary">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="text-sm leading-relaxed">{feature}</li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 ${
                  tier.popular ? "btn-primary" : "btn-secondary"
                }`}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Value Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm italic text-text-secondary/70 max-w-4xl mx-auto">
            <strong className="text-white">Guarantee:</strong>
            If we don't uncover at least {isLoading ? "$2,500" : formattedPrices.foundation} in verifiable
            cost avoidance or valuation upside within 30 days of delivery,
            we refund 50% of your fee.
          </p>
        </motion.div>

        {/* Payment and Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex justify-center gap-8 mt-8 text-sm text-text-secondary"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-electric-lime" />
            <span>Secure payment via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-electric-lime" />
            <span>Report delivered instantly</span>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12"
        >
          <p className="text-white font-medium mb-6">Trusted by startups and enterprises worldwide</p>
          <div className="flex justify-center gap-8 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-electric-lime" />
              <span>Secure & Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-electric-lime" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-electric-lime" />
              <span>Data-Driven Insights</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 