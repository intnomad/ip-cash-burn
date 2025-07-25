'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Lightbulb, 
  ArrowRight, 
  TrendingUp,
  Lock,
  CheckCircle,
  Sparkles,
  Shield,
  Check,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateTotalSavings, formatSavingsForDisplay } from '@/lib/savingsCalculator';

interface FreeCostPreviewData {
  totalCost: number;
  yearlyBreakdown: { year: number; cost: number }[];
  jurisdictionYearlyBreakdown: Record<string, { year: number; cost: number }[]>;
  jurisdictionCosts: { jurisdiction: string; cost: number }[];
  cashFlowAlerts: string[];
  oneGenericInsight: string;
  upgradeTeaser: string;
  aiInsights: string[];
  actionablePlan: string[];
  timeline: {
    filingToGrant: {
      min: number;
      max: number;
      average: number;
    };
    prosecutionDelays: number;
    industryFactor: number;
  };
}

interface FreeCostPreviewProps {
  previewData?: FreeCostPreviewData;
  userEmail: string;
  companyName: string;
  onUpgrade: () => void;
  isLoading?: boolean;
}

export default function FreeCostPreview({ 
  previewData, 
  userEmail, 
  companyName,
  onUpgrade, 
  isLoading = false 
}: FreeCostPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const jurisdictionLabels: { [key: string]: string } = {
    'USPTO': '🇺🇸 United States',
    'EPO': '🇪🇺 European Union',
    'IPOS': '🇸🇬 Singapore'
  };

  // Provide default values for graceful loading
  const defaultData: FreeCostPreviewData = {
    totalCost: 0,
    yearlyBreakdown: [],
    jurisdictionYearlyBreakdown: {},
    jurisdictionCosts: [],
    cashFlowAlerts: [],
    oneGenericInsight: "💡 Cost-Saving Tip: Loading your personalized insights...",
    upgradeTeaser: "Get detailed analysis and savings strategies...",
    aiInsights: [],
    actionablePlan: [],
    timeline: {
      filingToGrant: { min: 18, max: 36, average: 24 },
      prosecutionDelays: 6,
      industryFactor: 1.1
    }
  };

  const data = previewData || defaultData;
  
  // Debug logging
  console.log('FreeCostPreview data:', data);
  console.log('jurisdictionCosts:', data.jurisdictionCosts);
  console.log('totalCost:', data.totalCost);
  console.log('timeline data:', data.timeline);
  console.log('timeline filingToGrant:', data.timeline?.filingToGrant);
  console.log('timeline min:', data.timeline?.filingToGrant?.min);
  console.log('timeline max:', data.timeline?.filingToGrant?.max);
  console.log('timeline average:', data.timeline?.filingToGrant?.average);
  
  // Validate data structure
  if (!data.jurisdictionCosts || !Array.isArray(data.jurisdictionCosts)) {
    console.error('Invalid jurisdictionCosts data:', data.jurisdictionCosts);
    data.jurisdictionCosts = [];
  }
  
  if (typeof data.totalCost !== 'number' || isNaN(data.totalCost)) {
    console.error('Invalid totalCost data:', data.totalCost);
    data.totalCost = 0;
  }

  const [showSavingsBreakdown, setShowSavingsBreakdown] = React.useState(false);
  
  // Calculate comprehensive savings
  const savings = React.useMemo(() => {
    if (!data.totalCost || data.totalCost === 0) return null;
    
    // Create mock input and results for savings calculation
    const mockInput = {
      industry: 'Other',
      solutionDescription: '',
      jurisdictions: data.jurisdictionCosts.map(item => item.jurisdiction),
      solutionComplexity: 'Complex' as const,
      protectionDuration: 20 as const,
      estimatedClaims: 20
    };
    
    const mockResults = {
      totalCost: data.totalCost,
      jurisdictionCosts: Object.fromEntries(
        data.jurisdictionCosts.map(item => [
          item.jurisdiction, 
          {
            totalLifecycleCost: item.cost,
            filingToGrantCost: item.cost * 0.7,
            renewalCosts: item.cost * 0.3,
            breakdown: {
              officialFees: item.cost * 0.4,
              professionalFees: item.cost * 0.35,
              additionalCosts: item.cost * 0.25
            }
          }
        ])
      ),
      timeline: {
        filingToGrant: { min: 18, max: 36, average: 24 },
        totalTimeline: { min: 30, max: 48, average: 36 },
        prosecutionDelays: 6,
        industryFactor: 1.1
      },
      calculationDate: new Date().toISOString(),
      currency: 'USD'
    };
    
    return calculateTotalSavings(mockInput, mockResults);
  }, [data.totalCost, data.jurisdictionCosts]);

  // Loading state
  if (!previewData || isLoading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8"
        >
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-electric-lime/10 rounded-full mx-auto"></div>
              <div className="h-8 bg-white/10 rounded mx-auto w-64"></div>
              <div className="h-12 bg-white/10 rounded mx-auto w-48"></div>
              <div className="h-4 bg-white/10 rounded mx-auto w-32"></div>
            </div>
            <p className="text-white/60 mt-4">Generating your personalized IP cost report...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center bg-electric-lime text-black px-6 py-3 rounded-full mb-6 font-semibold text-lg shadow-lg">
          <CheckCircle className="w-6 h-6 mr-2" />
          🎉 Your Free IP Cost Report is Ready!
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Your Complete IP Investment Plan
        </h2>
        <div className="text-6xl font-bold text-electric-lime mb-3 tracking-tight">
          {data.totalCost && data.totalCost > 0 ? formatCurrency(data.totalCost) : 'Loading...'}
        </div>
        <p className="text-white/70 text-lg">
          Total estimated cost for <span className="text-electric-lime font-semibold">{companyName}</span> across selected jurisdictions (USD)
        </p>
        <p className="text-white/60 text-sm mt-2">
          <span className="text-electric-lime font-semibold">Direct Filing Strategy</span> - Individual applications filed directly in each jurisdiction. 
          <br />
          <span className="text-white/50 text-xs">PCT Route: Single international application followed by national phase entries (typically 30% higher cost but provides 30-month delay for market validation)</span>
        </p>
        <div className="mt-4 inline-flex items-center gap-4 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-electric-lime rounded-full"></div>
            Real 2025 fee data
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-electric-lime rounded-full"></div>
            20-year projection
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-electric-lime rounded-full"></div>
            AI-driven
          </div>
        </div>

        {/* Timeline Display */}
        <div className="mt-6 glass-panel p-4">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-electric-lime" />
            Expected Timeline
          </h4>
          <div className="flex items-center justify-center">
            <span className="text-2xl font-bold text-electric-lime">
              {data.timeline?.filingToGrant?.min || 18}-{data.timeline?.filingToGrant?.max || 36} months
            </span>
            <span className="ml-3 text-white/60 text-sm">filing to grant</span>
          </div>
          <div className="text-center mt-2">
            <span className="text-white/50 text-xs">
              Average: {data.timeline?.filingToGrant?.average || 24} months
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cost Breakdown Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Jurisdiction Breakdown - Full Width */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-electric-lime" />
            Cost by Jurisdiction
          </h3>
          <div className="space-y-4">
            {data.jurisdictionCosts && data.jurisdictionCosts.length > 0 ? (
              data.jurisdictionCosts.map((item, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-white">
                      {jurisdictionLabels[item.jurisdiction] || item.jurisdiction}
                    </h4>
                    <div className="text-right">
                      <div className="text-lg font-bold text-electric-lime">
                        {item.cost && item.cost > 0 ? formatCurrency(item.cost) : 'Calculating...'}
                      </div>
                      <div className="text-white/60 text-sm">Total cost</div>
                    </div>
                  </div>
                  
                  {/* Detailed breakdown - using estimated proportions */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-white/70">Official Fees</div>
                      <div className="text-white font-semibold">{formatCurrency(item.cost * 0.4)}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Legal Fees</div>
                      <div className="text-white font-semibold">{formatCurrency(item.cost * 0.35)}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Drawings & Docs</div>
                      <div className="text-white font-semibold">{formatCurrency(item.cost * 0.15)}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Translation</div>
                      <div className="text-white font-semibold">{formatCurrency(item.cost * 0.1)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/40 text-sm py-8">
                Loading jurisdiction data...
              </div>
            )}
          </div>
        </div>

        {/* Cumulative Fees Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-electric-lime" />
            Cumulative Investment Timeline
          </h3>
          <div className="bg-white/5 rounded-lg p-4">
            {data.yearlyBreakdown && data.yearlyBreakdown.length > 0 ? (
              <div className="space-y-4">
                {/* Chart SVG */}
                <div className="w-full h-48 relative">
                  <svg viewBox="0 0 800 200" className="w-full h-full">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 80 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="800" height="200" fill="url(#grid)" />
                    
                    {/* Multi-line chart with jurisdiction breakdown */}
                    {(() => {
                      const colors = ['rgb(192, 254, 92)', 'rgb(59, 130, 246)', 'rgb(236, 72, 153)'];
                      const jurisdictions = Object.keys(data.jurisdictionYearlyBreakdown || {});
                      
                      if (jurisdictions.length === 0) {
                        return null;
                      }
                      
                      // Calculate max values for scaling
                      let maxCumulative = 0;
                      let maxYear = 20;
                      
                                              jurisdictions.forEach(jurisdiction => {
                          const jurisdictionData = data.jurisdictionYearlyBreakdown[jurisdiction];
                          if (jurisdictionData) {
                            let cumulative = 0;
                            jurisdictionData.forEach(item => {
                              if (item.year <= 20) {
                                cumulative += item.cost;
                                maxCumulative = Math.max(maxCumulative, cumulative);
                              }
                            });
                          }
                        });
                      
                      return (
                        <>
                          {/* Draw lines for each jurisdiction */}
                          {jurisdictions.map((jurisdiction, index) => {
                            const jurisdictionData = data.jurisdictionYearlyBreakdown[jurisdiction];
                            if (!jurisdictionData) return null;
                            
                            const relevantYears = jurisdictionData.filter(item => item.year <= 20);
                            let cumulative = 0;
                            const cumulativeData = relevantYears.map(item => {
                              cumulative += item.cost;
                              return { year: item.year, cumulative };
                            });
                            
                            // Create path for this jurisdiction
                            const pathData = cumulativeData.map((point, pointIndex) => {
                              const x = (point.year / maxYear) * 720 + 40;
                              const y = 180 - ((point.cumulative / maxCumulative) * 160);
                              return `${pointIndex === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ');
                            
                            const color = colors[index % colors.length];
                            
                            return (
                              <g key={jurisdiction}>
                                {/* Chart line */}
                                <path
                                  d={pathData}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                
                                {/* Data points */}
                                {cumulativeData.map((point) => {
                                  const x = (point.year / maxYear) * 720 + 40;
                                  const y = 180 - ((point.cumulative / maxCumulative) * 160);
                                  return (
                                    <circle
                                      key={point.year}
                                      cx={x}
                                      cy={y}
                                      r="3"
                                      fill={color}
                                      className="drop-shadow-lg"
                                    />
                                  );
                                })}
                              </g>
                            );
                          })}
                          
                          {/* Y-axis labels */}
                          <text x="10" y="25" fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="start">
                            {formatCurrency(maxCumulative)}
                          </text>
                          <text x="10" y="105" fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="start">
                            {formatCurrency(maxCumulative / 2)}
                          </text>
                          <text x="10" y="185" fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="start">
                            $0
                          </text>
                          
                          {/* X-axis labels */}
                          {[0, 5, 10, 15, 20].map(year => {
                            const x = (year / maxYear) * 720 + 40;
                            return (
                              <text
                                key={year}
                                x={x}
                                y="195"
                                fill="rgba(255,255,255,0.6)"
                                fontSize="12"
                                textAnchor="middle"
                              >
                                Year {year}
                              </text>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                
                {/* Chart Legend */}
                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center gap-4">
                    {Object.keys(data.jurisdictionYearlyBreakdown || {}).map((jurisdiction, index) => {
                      const colors = ['rgb(192, 254, 92)', 'rgb(59, 130, 246)', 'rgb(236, 72, 153)'];
                      const color = colors[index % colors.length];
                      return (
                        <div key={jurisdiction} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span>{jurisdictionLabels[jurisdiction] || jurisdiction}</span>
                        </div>
                      );
                    })}
                  </div>
                  <span>Total: {formatCurrency(data.totalCost)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/40 text-sm py-8">
                Loading chart data...
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cost-Saving Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Show AI insights as cost-saving tips */}
        {data.aiInsights && data.aiInsights.length > 0 ? (
          data.aiInsights.map((insight, index) => (
            <div key={index} className="glass-panel p-6">
              <div className="bg-gradient-to-r from-electric-lime/20 to-electric-lime/10 border border-electric-lime/30 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-electric-lime flex-shrink-0 mt-1" />
                  <p className="text-white text-lg font-medium leading-relaxed">
                    {insight}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Fallback to single generic insight if no AI insights */
          <div className="glass-panel p-6">
            <div className="bg-gradient-to-r from-electric-lime/20 to-electric-lime/10 border border-electric-lime/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-electric-lime flex-shrink-0 mt-1" />
                <p className="text-white text-lg font-medium leading-relaxed">
                  {data.oneGenericInsight || "💡 Cost-Saving Tip: Consider filing a provisional patent first to secure priority at lower cost."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actionable Plan */}
        {data.actionablePlan && data.actionablePlan.length > 0 && (
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Target className="w-6 h-6 text-electric-lime" />
              Actionable Plan
            </h3>
            <div className="space-y-3">
              {data.actionablePlan.map((action, index) => {
                // Parse the action text to handle bold formatting and remove bullet points
                const cleanAction = action.replace(/^•\s*/, ''); // Remove leading bullet point
                
                // Split by bold markers and render with proper formatting
                const parts = cleanAction.split(/(\*\*.*?\*\*)/g);
                
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-electric-lime rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          // Bold text
                          const boldText = part.slice(2, -2);
                          return <span key={partIndex} className="font-bold text-white">{boldText}</span>;
                        } else {
                          // Regular text
                          return <span key={partIndex}>{part}</span>;
                        }
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Enhanced Upgrade Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <div className="glass-panel p-8 relative overflow-hidden border-t-2 border-electric-lime/30">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-electric-lime/20 to-electric-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-electric-lime/30">
                <Sparkles className="w-10 h-10 text-electric-lime" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-6">
                Ready to save up to <span className="text-electric-lime font-bold">
                  {savings ? formatSavingsForDisplay(savings).totalFormatted : '$0'}
                </span> on your IP journey?
              </h3>
              <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed">
                Unlock a personalized strategy report revealing <span className="font-bold">cash-saving tactics</span>, <span className="font-bold">grant matches</span>, and <span className="font-bold">industry benchmarks</span>—built for founders and SMEs. Instantly see how to optimize filings and avoid hidden legal/admin costs.
              </p>
              <p className="text-white/60 italic text-base max-w-2xl mx-auto">
                *Not legal advice, but proven to help founders save big before talking to a lawyer.*
              </p>
            </div>

            {/* Consulting Packages */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* IP Foundation Package */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative p-6 rounded-2xl border-2 border-border-subtle bg-surface-glass hover:border-electric-lime/50 transition-all cursor-pointer"
                onClick={onUpgrade}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">IP Foundation</h3>
                  <div className="text-2xl font-bold text-electric-lime mb-2">$2,500</div>
                  <p className="text-white/60 text-sm">Pre-Seed → Seed (≤ US $1 M raised)</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">90-min strategy call</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">3-year IP roadmap + cost-benefit analysis</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
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
                 onClick={onUpgrade}
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
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in Foundation</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Investor-ready IP valuation report</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
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
                onClick={onUpgrade}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">IP Excellence</h3>
                  <div className="text-2xl font-bold text-electric-lime mb-2">From $15,000</div>
                  <p className="text-white/60 text-sm">Series B+ / IP-heavy companies</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in Growth Strategy</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Board-ready IP presentation</span>
                  </li>
                  <li className="flex items-start text-text-secondary">
                    <Check className="w-4 h-4 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">IP portfolio optimisation</span>
                  </li>
                </ul>

                <Button className="w-full btn-secondary">
                  Book Executive Briefing
                </Button>
              </motion.div>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  🔒 Secure payment via Stripe
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  📧 Report delivered instantly
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 