'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PatentCostResult, DetailedPatentCostBreakdown } from '@/types/calculationTypes';
import { AIInsight } from '@/lib/aiInsights';
import IPCalculatorForm from './PatentCalculatorForm';
import FreeCostPreview from './FreeCostPreview';
import StrategicInsightsPaywall from './StrategicInsightsPaywall';
import PatentCostResultsDisplay from './PatentCostResultsDisplay';

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

// Component that uses searchParams - needs to be wrapped in Suspense
function PatentCalculatorContent() {
  const [calculationResults, setCalculationResults] = useState<PatentCostResult | DetailedPatentCostBreakdown | null>(null);
  const [freeCostPreview, setFreeCostPreview] = useState<FreeCostPreviewData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFreemium, setShowFreemium] = useState(false);
  const [showProfessional, setShowProfessional] = useState(false);
  const [isDetailed, setIsDetailed] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [calculationId, setCalculationId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [strategicInsightsUnlocked, setStrategicInsightsUnlocked] = useState(false);
  
  const searchParams = useSearchParams();

  // Scroll to top when freemium view is shown
  useEffect(() => {
    if (showFreemium) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showFreemium]);

  // New handler for free preview from email gate
  const handleFreeCostPreview = (previewData: FreeCostPreviewData, email: string, company: string) => {
    setFreeCostPreview(previewData);
    setUserEmail(email);
    setCompanyName(company);
    setShowFreemium(true);
    setShowResults(false); // Hide form
  };

  const handleCalculationResults = (
    results: PatentCostResult | DetailedPatentCostBreakdown, 
    insights: AIInsight[], 
    detailed: boolean = false,
    email?: string
  ) => {
    setCalculationResults(results);
    setAiInsights(insights);
    setShowResults(true);
    setIsDetailed(detailed);
    
    if (email) {
      setUserEmail(email);
    }
    
    // Generate a unique calculation ID for this session
    setCalculationId(`calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  };

  // Handle free preview data from email gate modal
  const handleEmailSubmitWithPreview = (data: { previewData: FreeCostPreviewData; userEmail: string; companyName: string }) => {
    console.log('Dashboard received preview data:', data);
    console.log('Preview data timeline:', data.previewData.timeline);
    setFreeCostPreview(data.previewData);
    setUserEmail(data.userEmail);
    setCompanyName(data.companyName);
    setShowFreemium(true);
    setShowResults(false);
    
    // Scroll to top when showing results
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleUpgradeToProfessional = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create checkout session for professional analysis
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'professional',
          email: userEmail,
          calculationId: calculationId
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to Demo Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleUnlockStrategicInsights = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create checkout session for strategic insights
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'strategic_insights',
          email: userEmail,
          calculationId: calculationId
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to Demo Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Strategic insights checkout error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleNewCalculation = () => {
    setCalculationResults(null);
    setFreeCostPreview(null);
    setAiInsights([]);
    setShowResults(false);
    setShowFreemium(false);
    setShowProfessional(false);
    setIsDetailed(false);
    setUserEmail('');
    setCompanyName('');
    setCalculationId('');
    setStrategicInsightsUnlocked(false);
  };

  // Check for payment success from URL params
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    
    if (success === 'true' && sessionId) {
      setStrategicInsightsUnlocked(true);
      setShowProfessional(true);
      setShowFreemium(false);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-navy via-dark-navy to-electric-lime/5">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              IP Cost Calculator
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Get instant cost estimates and strategic insights for protecting your intellectual property across multiple jurisdictions.
            </p>
          </div>

          {/* Main Content Area */}
          {!showResults && !showFreemium && !showProfessional ? (
            /* Calculator Form */
            <div className="animate-fade-in-up">
              <IPCalculatorForm 
                onResults={handleCalculationResults}
                onFreeCostPreview={handleEmailSubmitWithPreview}
              />
            </div>
          ) : showFreemium ? (
            /* Free Cost Preview */
            <div className="space-y-8">
              {/* New Calculation Button */}
              <div className="flex justify-end animate-fade-in-up">
                <button
                  onClick={handleNewCalculation}
                  className="btn-secondary group"
                >
                  <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Calculation
                </button>
              </div>

              {/* Free Cost Preview Component */}
              {freeCostPreview && (
                <div className="animate-fade-in-up-delay-1">
                  {(() => { console.log('Rendering FreeCostPreview with data:', freeCostPreview); return null; })()}
                  <FreeCostPreview
                    previewData={freeCostPreview}
                    userEmail={userEmail}
                    companyName={companyName}
                    onUpgrade={handleUpgradeToProfessional}
                    isLoading={isProcessingPayment}
                  />
                </div>
              )}
            </div>
          ) : showProfessional ? (
            /* Professional Analysis (Post-Payment) */
            <div className="space-y-8">
              {/* Results Header with New Calculation Button */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in-up">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Professional IP Strategy Report
                  </h2>
                  <p className="text-white/60 text-sm mt-1">
                    Comprehensive analysis with strategic insights for {companyName}
                  </p>
                </div>
                <button
                  onClick={handleNewCalculation}
                  className="btn-secondary group"
                >
                  <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Calculation
                </button>
              </div>

              {/* Professional Analysis Content */}
              {calculationResults && (
                <div className="animate-fade-in-up-delay-1">
                  <PatentCostResultsDisplay
                    results={calculationResults}
                    insights={aiInsights}
                    userEmail={userEmail}
                    companyName={companyName}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Fallback - Legacy Results */
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in-up">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Your IP Strategy Report
                  </h2>
                  <p className="text-white/60 text-sm mt-1">
                    Instant cost calculation + strategic insights to accelerate your IP decisions
                  </p>
                </div>
                <button
                  onClick={handleNewCalculation}
                  className="btn-secondary group"
                >
                  <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Calculation
                </button>
              </div>

              {calculationResults && (
                <div className="animate-fade-in-up-delay-1">
                  <PatentCostResultsDisplay
                    results={calculationResults}
                    insights={aiInsights}
                    userEmail={userEmail}
                    companyName={companyName}
                  />
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center mt-16 pt-12 border-t border-white/10 animate-fade-in-up">
            <p className="text-white/60 mb-4">
              Trusted by startups and enterprises worldwide
            </p>
            <div className="flex justify-center items-center space-x-8 text-white/40">
              <span>🔒 Secure & Confidential</span>
              <span>⚡ Instant Results</span>
              <span>📊 Data-Driven Insights</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main component with Suspense boundary
export default function PatentCalculatorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-electric-lime mb-4"></div>
          <p className="text-white/70">Loading calculator...</p>
        </div>
      </div>
    }>
      <PatentCalculatorContent />
    </Suspense>
  );
} 