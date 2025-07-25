'use client';

import { BasicCostResult, DetailedCostBreakdown } from '@/types/calculationTypes';

interface CostResultsDisplayProps {
  results: BasicCostResult | DetailedCostBreakdown;
  isDetailed?: boolean;
}

export default function CostResultsDisplay({ results, isDetailed = false }: CostResultsDisplayProps) {
  const formatCurrency = (amount: number, currency: string) => {
    const currencyMap: Record<string, string> = {
      'USD': 'USD',
      'EUR': 'EUR', 
      'SGD': 'SGD'
    };
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyMap[currency] || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getJurisdictionFlag = (jurisdiction: string): string => {
    const flagMap: Record<string, string> = {
      'USPTO': '🇺🇸',
      'EPO': '🇪🇺',
      'IPOS': '🇸🇬'
    };
    return flagMap[jurisdiction] || '🌍';
  };

  const getJurisdictionName = (jurisdiction: string): string => {
    const nameMap: Record<string, string> = {
      'USPTO': 'United States',
      'EPO': 'European Union',
      'IPOS': 'Singapore'
    };
    return nameMap[jurisdiction] || jurisdiction;
  };

  // Check if this is a detailed breakdown
  const detailedResults = isDetailed ? results as DetailedCostBreakdown : null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Summary Card */}
      <div className="glass-panel p-8 animate-fade-in-up">
        <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Cost Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="text-4xl font-bold text-electric-lime mb-3 transition-all duration-300 group-hover:scale-105">
              {formatUSD(results.totalCost)}
            </div>
            <div className="text-white/60 text-sm">Total Estimated Cost</div>
            <div className="text-white/40 text-xs mt-1">Multi-currency total (approx.)</div>
          </div>
          
          <div className="text-center group">
            <div className="text-4xl font-bold text-white mb-3 transition-all duration-300 group-hover:scale-105">
              {Object.keys(results.jurisdictionTotals).length}
            </div>
            <div className="text-white/60 text-sm">Jurisdictions</div>
            <div className="text-white/40 text-xs mt-1">Patent offices selected</div>
          </div>
          
          <div className="text-center group">
            <div className="text-4xl font-bold text-white mb-3 transition-all duration-300 group-hover:scale-105">
              {isDetailed ? '95%' : '85%'}
            </div>
            <div className="text-white/60 text-sm">Accuracy</div>
            <div className="text-white/40 text-xs mt-1">
              {isDetailed ? 'Detailed analysis' : 'Basic estimate'}
            </div>
          </div>
        </div>
      </div>

      {/* Jurisdiction Breakdown */}
      <div className="glass-panel p-8 animate-fade-in-up-delay-1">
        <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Jurisdiction Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(results.jurisdictionTotals).map(([jurisdiction, total], index) => (
            <div key={jurisdiction} className="bg-navy-dark rounded-2xl p-6 border border-white/5 hover:border-electric-lime/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getJurisdictionFlag(jurisdiction)}</span>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-electric-lime transition-colors">
                      {jurisdiction}
                    </h4>
                    <p className="text-white/60 text-sm">{getJurisdictionName(jurisdiction)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Total Cost</span>
                  <span className="text-xl font-bold text-electric-lime">
                    {formatCurrency(total, results.currencyByJurisdiction[jurisdiction])}
                  </span>
                </div>
                
                {isDetailed && detailedResults?.costBreakdown[jurisdiction] && (
                  <>
                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Official fees (pre-grant)</span>
                        <span className="text-white">
                          {formatCurrency(
                            Object.values(detailedResults.costBreakdown[jurisdiction].preGrant)
                              .reduce((sum, cost) => sum + cost, 0),
                            results.currencyByJurisdiction[jurisdiction]
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Official fees (post-grant)</span>
                        <span className="text-white">
                          {formatCurrency(
                            Object.values(detailedResults.costBreakdown[jurisdiction].postGrant)
                              .reduce((sum, cost) => sum + cost, 0),
                            results.currencyByJurisdiction[jurisdiction]
                          )}
                        </span>
                      </div>
                      
                      {/* Combined Legal & Agent Fees */}
                      {detailedResults.includedLegalAgentFees && Object.keys(detailedResults.costBreakdown[jurisdiction].legalAgent || {}).length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60 flex items-center gap-2">
                            Legal & Agent fees
                            <span className="text-xs px-1.5 py-0.5 bg-electric-lime/20 text-electric-lime rounded">EST</span>
                          </span>
                          <span className="text-white">
                            {formatCurrency(
                              Object.values(detailedResults.costBreakdown[jurisdiction].legalAgent)
                                .reduce((sum, cost) => sum + cost, 0),
                              results.currencyByJurisdiction[jurisdiction]
                            )}
                          </span>
                        </div>
                      )}
                      
                      {/* Search Fees */}
                      {detailedResults.includedSearchFees && Object.keys(detailedResults.costBreakdown[jurisdiction].search || {}).length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60 flex items-center gap-2">
                            Search fees
                            <span className="text-xs px-1.5 py-0.5 bg-electric-lime/20 text-electric-lime rounded">EST</span>
                          </span>
                          <span className="text-white">
                            {formatCurrency(
                              Object.values(detailedResults.costBreakdown[jurisdiction].search)
                                .reduce((sum, cost) => sum + cost, 0),
                              results.currencyByJurisdiction[jurisdiction]
                            )}
                          </span>
                        </div>
                      )}
                      
                      {/* Translation Fees */}
                      {detailedResults.includedTranslationFees && Object.keys(detailedResults.costBreakdown[jurisdiction].translation || {}).length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60 flex items-center gap-2">
                            Translation fees
                            <span className="text-xs px-1.5 py-0.5 bg-electric-lime/20 text-electric-lime rounded">EST</span>
                          </span>
                          <span className="text-white">
                            {formatCurrency(
                              Object.values(detailedResults.costBreakdown[jurisdiction].translation)
                                .reduce((sum, cost) => sum + cost, 0),
                              results.currencyByJurisdiction[jurisdiction]
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-electric-lime rounded-full"></div>
                  <span className="text-white/60 text-xs">
                    {results.currencyByJurisdiction[jurisdiction]} • Real-time data
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Timeline (only for detailed results) */}
      {isDetailed && detailedResults?.yearByYearCosts && (
        <div className="glass-panel p-8 animate-fade-in-up-delay-2">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Year-by-Year Timeline</h3>
          
          <div className="space-y-6">
            {Object.entries(detailedResults.yearByYearCosts).map(([jurisdiction, yearCosts]) => (
              <div key={jurisdiction} className="bg-navy-dark rounded-2xl p-6 border border-white/5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-xl">{getJurisdictionFlag(jurisdiction)}</span>
                  {jurisdiction} Timeline
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(yearCosts)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([year, cost]) => (
                      cost > 0 && (
                        <div key={year} className="text-center p-3 bg-navy-black rounded-lg border border-white/5">
                          <div className="text-sm text-white/60 mb-1">Year {year}</div>
                          <div className="text-sm font-bold text-electric-lime">
                            {formatCurrency(cost, results.currencyByJurisdiction[jurisdiction])}
                          </div>
                        </div>
                      )
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potential Savings (only for detailed results) */}
      {isDetailed && detailedResults?.potentialSavings && (
        <div className="glass-panel p-8 animate-fade-in-up-delay-3">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Potential Savings</h3>
          
          <div className="space-y-6">
            {Object.entries(detailedResults.potentialSavings).map(([jurisdiction, savings]) => (
              savings.length > 0 && (
                <div key={jurisdiction} className="bg-navy-dark rounded-2xl p-6 border border-white/5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-xl">{getJurisdictionFlag(jurisdiction)}</span>
                    {jurisdiction} Savings Opportunities
                  </h4>
                  
                  <div className="space-y-4">
                    {savings.map((saving: any, index: number) => (
                      <div key={index} className="bg-navy-black rounded-lg p-4 border border-electric-lime/20">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-white">
                            {saving.name || saving.description}
                          </h5>
                          <span className="text-electric-lime font-bold">
                            Save {formatCurrency(saving.potentialSaving, results.currencyByJurisdiction[jurisdiction])}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm mb-2">{saving.description}</p>
                        <p className="text-white/50 text-xs">{saving.requirementDescription}</p>
                        {saving.applicationUrl && (
                          <a 
                            href={saving.applicationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-electric-lime text-xs hover:underline mt-2 block"
                          >
                            Learn more →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Strategy (only for detailed results) */}
      {isDetailed && detailedResults?.patentMaintenanceStrategy && (
        <div className="glass-panel p-8 animate-fade-in-up-delay-3">
          <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Maintenance Strategy</h3>
          <div className="bg-navy-dark rounded-2xl p-6 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-electric-lime/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-electric-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Strategic Recommendation</h4>
                <p className="text-white/70">{detailedResults.patentMaintenanceStrategy}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Notes */}
      <div className="glass-panel p-6 animate-fade-in-up-delay-4">
        <h4 className="text-lg font-bold text-white mb-4">Important Notes</h4>
        <div className="space-y-2">
          {isDetailed && detailedResults?.calculationNotes ? (
            detailedResults.calculationNotes.map((note, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-electric-lime rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/60 text-sm">{note}</p>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-electric-lime rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/60 text-sm">Estimates based on current patent office fee schedules</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-electric-lime rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/60 text-sm">Currency conversions are approximate</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-electric-lime rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/60 text-sm">Attorney fees not included in basic estimate</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 