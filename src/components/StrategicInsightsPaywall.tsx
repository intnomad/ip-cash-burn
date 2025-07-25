'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, DollarSign, Target, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatentCostResult, DetailedPatentCostBreakdown } from '@/types/calculationTypes';

interface StrategicInsightsPaywallProps {
  costResults: PatentCostResult | DetailedPatentCostBreakdown;
  userEmail: string;
  onUnlock: () => void;
  isLoading?: boolean;
}

export default function StrategicInsightsPaywall({ 
  costResults, 
  userEmail, 
  onUnlock, 
  isLoading = false 
}: StrategicInsightsPaywallProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Free Cost Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-electric-lime/10 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-electric-lime" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your IP Cost Breakdown</h2>
            <p className="text-white/60">Instant calculation across selected jurisdictions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(costResults.jurisdictionCosts).map(([jurisdiction, costs]) => {
            return (
              <div key={jurisdiction} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">{jurisdiction}</h3>
                  <div className="text-2xl">
                    {jurisdiction === 'USPTO' && '🇺🇸'}
                    {jurisdiction === 'EPO' && '🇪🇺'}
                    {jurisdiction === 'IPOS' && '🇸🇬'}
                  </div>
                </div>
                <div className="text-2xl font-bold text-electric-lime mb-2">
                  {formatCurrency(costs.totalLifecycleCost, 'USD')}
                </div>
                <p className="text-white/60 text-sm">Total lifecycle cost</p>
              </div>
            );
          })}
        </div>

        <div className="bg-electric-lime/10 rounded-xl p-6 border border-electric-lime/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Total Investment</h3>
              <p className="text-white/70">Estimated across all jurisdictions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-electric-lime">
                ${costResults.totalCost.toLocaleString()}
              </div>
              <p className="text-white/60 text-sm">Over selected duration</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strategic Insights Paywall */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        {/* Blurred Preview */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-dark/50 to-navy-dark z-10"></div>
          <div className="filter blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Strategic Insights</h2>
                <p className="text-white/60">AI-powered analysis of your IP strategy</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                  Top 3 IP Risks & Opportunities
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-400 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Patent Landscape Analysis</h4>
                      <p className="text-white/60 text-sm">Your technology space shows significant competitive activity...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-1">
                      <span className="text-yellow-400 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Filing Strategy Optimization</h4>
                      <p className="text-white/60 text-sm">Based on your stage and budget, we recommend...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-1">
                      <span className="text-green-400 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Cost Savings Opportunities</h4>
                      <p className="text-white/60 text-sm">We identified potential savings of up to 35%...</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-electric-lime" />
                  Your Actionable IP Plan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-electric-lime" />
                    <span className="text-white">Immediate next steps (0-30 days)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-electric-lime" />
                    <span className="text-white">Strategic filing timeline (3-12 months)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-electric-lime" />
                    <span className="text-white">Budget optimization recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-electric-lime" />
                    <span className="text-white">Risk mitigation strategies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consulting Packages Overlay */}
          <div className="absolute inset-0 z-20 bg-navy-dark/95 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                A Clear Strategy for Every Stage
              </h3>
              <p className="text-white/70 mb-6">
                Choose the perfect IP consulting package for your business stage
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* IP Foundation Package */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative p-6 rounded-2xl border-2 border-border-subtle bg-surface-glass hover:border-electric-lime/50 transition-all cursor-pointer"
                onClick={onUnlock}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">IP Foundation</h3>
                  <div className="text-2xl font-bold text-electric-lime mb-2">$2,500</div>
                  <p className="text-white/60 text-sm">Pre-Seed → Seed (≤ US $1 M raised)</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">90-min strategy call</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">3-year IP roadmap + cost-benefit analysis</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Grant opportunities (≥ US $10 k potential)</span>
                  </li>
                </ul>

                <Button className="w-full btn-secondary">
                  Start My IP Health Check
                </Button>
              </motion.div>

              {/* IP Growth Strategy Package */}
               <motion.div
                 whileHover={{ y: -4 }}
                 className="relative p-6 pt-10 rounded-2xl border-2 border-electric-lime bg-lime-glow transition-all cursor-pointer"
                 onClick={onUnlock}
               >
                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                   <span className="bg-electric-lime text-navy-black px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                     MOST POPULAR
                   </span>
                 </div>

                 <div className="text-center mb-6">
                   <h3 className="text-xl font-semibold text-white mb-1">IP Growth Strategy</h3>
                  <div className="text-2xl font-bold text-electric-lime mb-2">$6,500</div>
                  <p className="text-white/60 text-sm">Series A (US $1–10 M raised)</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in Foundation</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Investor-ready IP valuation report</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Competitive IP landscape analysis</span>
                  </li>
                </ul>

                <Button className="w-full btn-primary">
                  Get Investor-Ready
                </Button>
              </motion.div>

              {/* IP Excellence Package */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative p-6 rounded-2xl border-2 border-border-subtle bg-surface-glass hover:border-electric-lime/50 transition-all cursor-pointer"
                onClick={onUnlock}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">IP Excellence</h3>
                  <div className="text-2xl font-bold text-electric-lime mb-2">From $15,000</div>
                  <p className="text-white/60 text-sm">Series B+ / IP-heavy companies</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in Growth Strategy</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Board-ready IP presentation</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">IP portfolio optimisation</span>
                  </li>
                </ul>

                <Button className="w-full btn-secondary">
                  Book Executive Briefing
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 