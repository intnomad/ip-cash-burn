'use client';

import { PatentCostResult, DetailedPatentCostBreakdown } from '@/types/calculationTypes';
import { AIInsight } from '@/lib/aiInsights';

interface PatentCostResultsDisplayProps {
  results: PatentCostResult | DetailedPatentCostBreakdown;
  insights?: AIInsight[];
  userEmail?: string;
  companyName?: string;
}

export default function PatentCostResultsDisplay({ 
  results, 
  insights = [], 
  userEmail, 
  companyName 
}: PatentCostResultsDisplayProps) {
  const isDetailed = 'costBreakdown' in results;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeline = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} months`;
    } else if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} months`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Patent Cost & Timeline Analysis
        </h2>
        <p className="text-white/70 text-lg">
          Comprehensive cost estimates and timeline projections for your patent strategy
        </p>
      </div>

      {/* Total Cost Summary */}
      <div className="glass-panel p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Total Investment</h3>
          <div className="text-4xl font-bold text-electric-lime">
            {formatCurrency(results.totalCost)}
          </div>
          <p className="text-white/60 text-sm mt-2">
            All costs in USD • {Object.keys(results.jurisdictionCosts).length} jurisdiction{Object.keys(results.jurisdictionCosts).length > 1 ? 's' : ''}
          </p>
          <p className="text-white/60 text-sm mt-2">
            <span className="text-electric-lime font-semibold">Direct Filing Strategy</span> - Individual applications filed directly in each jurisdiction. 
            <br />
            <span className="text-white/50 text-xs">PCT Route: Single international application followed by national phase entries (typically 30% higher cost but provides 30-month delay for market validation)</span>
          </p>
        </div>

        {/* Timeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-electric-lime mb-2">
              {formatTimeline(results.timeline.filingToGrant.average)}
            </div>
            <div className="text-white/70 text-sm">Filing to Grant</div>
            <div className="text-white/50 text-xs mt-1">
              {formatTimeline(results.timeline.filingToGrant.min)} - {formatTimeline(results.timeline.filingToGrant.max)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-electric-lime mb-2">
              {results.timeline.prosecutionDelays}
            </div>
            <div className="text-white/70 text-sm">Prosecution Delays</div>
            <div className="text-white/50 text-xs mt-1">Additional months</div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-electric-lime mb-2">
              {results.timeline.industryFactor.toFixed(1)}x
            </div>
            <div className="text-white/70 text-sm">Industry Factor</div>
            <div className="text-white/50 text-xs mt-1">Timeline multiplier</div>
          </div>
        </div>
      </div>

      {/* Jurisdiction Breakdown */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-white mb-6">Cost Breakdown by Jurisdiction</h3>
        <div className="space-y-4">
          {Object.entries(results.jurisdictionCosts).map(([jurisdiction, costs]) => (
            <div key={jurisdiction} className="p-4 bg-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white">
                  {jurisdiction === 'USPTO' ? 'United States (USPTO)' :
                   jurisdiction === 'EPO' ? 'European Union (EPO)' :
                   jurisdiction === 'IPOS' ? 'Singapore (IPOS)' : jurisdiction}
                </h4>
                <div className="text-right">
                  <div className="text-lg font-bold text-electric-lime">
                    {formatCurrency(costs.totalLifecycleCost)}
                  </div>
                  <div className="text-white/60 text-sm">Total lifecycle cost</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-white/70">Official Fees</div>
                  <div className="text-white font-semibold">{formatCurrency(costs.breakdown.officialFees)}</div>
                </div>
                <div>
                  <div className="text-white/70">Legal Fees</div>
                  <div className="text-white font-semibold">{formatCurrency(costs.breakdown.professionalFees)}</div>
                </div>
                <div>
                  <div className="text-white/70">Drawings & Docs</div>
                  <div className="text-white font-semibold">{formatCurrency(costs.breakdown.additionalCosts * 0.6)}</div>
                </div>
                <div>
                  <div className="text-white/70">Translation</div>
                  <div className="text-white font-semibold">{formatCurrency(costs.breakdown.additionalCosts * 0.4)}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-white/70">Filing to Grant</div>
                    <div className="text-white font-semibold">{formatCurrency(costs.filingToGrantCost)}</div>
                  </div>
                  <div>
                    <div className="text-white/70">Renewal Costs</div>
                    <div className="text-white font-semibold">{formatCurrency(costs.renewalCosts)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filing Strategy Comparison */}
      {results.filingStrategyComparison && (
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-6">Filing Strategy Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-bold text-white mb-3">Direct Filing</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Cost:</span>
                  <span className="text-electric-lime font-semibold">
                    {formatCurrency(results.filingStrategyComparison.directFiling.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Timeline:</span>
                  <span className="text-white font-semibold">
                    {formatTimeline(results.filingStrategyComparison.directFiling.timeline.filingToGrant.average)}
                  </span>
                </div>
                <div className="text-white/50 text-xs mt-2">
                  Recommended for 1-2 jurisdictions
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-electric-lime/30">
              <h4 className="font-bold text-white mb-3">PCT Route</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Cost:</span>
                  <span className="text-electric-lime font-semibold">
                    {formatCurrency(results.filingStrategyComparison.pctRoute.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Timeline:</span>
                  <span className="text-white font-semibold">
                    {formatTimeline(results.filingStrategyComparison.pctRoute.timeline.filingToGrant.average)}
                  </span>
                </div>
                <div className="text-white/50 text-xs mt-2">
                  Recommended for 3 jurisdictions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown (if available) */}
      {isDetailed && 'costBreakdown' in results && (
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-6">Detailed Cost Breakdown</h3>
          <div className="space-y-6">
            {Object.entries(results.costBreakdown).map(([jurisdiction, breakdown]) => (
              <div key={jurisdiction} className="p-4 bg-white/5 rounded-xl">
                <h4 className="font-bold text-white mb-4">
                  {jurisdiction === 'USPTO' ? 'United States (USPTO)' :
                   jurisdiction === 'EPO' ? 'European Union (EPO)' :
                   jurisdiction === 'IPOS' ? 'Singapore (IPOS)' : jurisdiction}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-white mb-3">Official Fees</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Filing:</span>
                        <span className="text-white">{formatCurrency(breakdown.officialFees.filing)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Search:</span>
                        <span className="text-white">{formatCurrency(breakdown.officialFees.search)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Examination:</span>
                        <span className="text-white">{formatCurrency(breakdown.officialFees.examination)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Grant:</span>
                        <span className="text-white">{formatCurrency(breakdown.officialFees.grant)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Extra Claims:</span>
                        <span className="text-white">{formatCurrency(breakdown.officialFees.extraClaims)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Renewal:</span>
                        <span className="text-white">{formatCurrency(breakdown.officialFees.renewal)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-white mb-3">Professional Fees</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Base Fee:</span>
                        <span className="text-white">{formatCurrency(breakdown.professionalFees.baseFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Complexity Multiplier:</span>
                        <span className="text-white">{breakdown.professionalFees.complexityMultiplier}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Jurisdiction Multiplier:</span>
                        <span className="text-white">{breakdown.professionalFees.jurisdictionMultiplier}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Prosecution Multiplier:</span>
                        <span className="text-white">{breakdown.professionalFees.prosecutionMultiplier.toFixed(2)}x</span>
                      </div>
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total Professional:</span>
                          <span className="text-electric-lime">{formatCurrency(breakdown.professionalFees.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculation Notes */}
      {isDetailed && 'calculationNotes' in results && (
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4">Calculation Notes</h3>
          <div className="space-y-2">
            {results.calculationNotes.map((note, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-electric-lime rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-white/80">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-6">Strategic Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-electric-lime/10 border border-electric-lime/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-electric-lime rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-dark-navy" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{insight.title}</h4>
                    <p className="text-white/80 text-sm">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-white/50 text-sm">
        <p>Calculation performed on {new Date(results.calculationDate).toLocaleDateString()}</p>
        <p>All amounts in USD • Exchange rates as of calculation date</p>
      </div>
    </div>
  );
} 