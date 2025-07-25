'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Calendar, Users, Phone, Mail } from 'lucide-react';

interface PaymentDetails {
  sessionId: string;
  calculationId: string;
  tier: 'essential' | 'professional' | 'strategic';
  amount?: number;
  currency?: string;
}

const TIER_BENEFITS = {
  essential: {
    name: 'Essential Analysis',
    price: 'S$49',
    features: [
      'Detailed cost breakdown by jurisdiction',
      'Year-by-year timeline with maintenance fees', 
      'Basic AI insights & recommendations',
      'Entity discount identification',
      'PDF export of analysis'
    ],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  professional: {
    name: 'Professional Analysis',
    price: 'S$79',
    features: [
      'Everything in Essential plan',
      'Competitive landscape analysis',
      'Grant opportunity matching',
      'Priority filing recommendations',
      'Trade secret vs patent analysis'
    ],
    color: 'text-electric-lime',
    bgColor: 'bg-electric-lime/10',
    borderColor: 'border-electric-lime/30'
  },
  strategic: {
    name: 'Strategic Consultation',
    price: 'S$149',
    features: [
      'Everything in Professional plan',
      '30-minute strategy consultation call',
      'Business valuation impact analysis',
      'Custom filing strategy roadmap',
      '30 days email support'
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  }
};

// Component that uses searchParams - needs to be wrapped in Suspense
function PaymentSuccessContent() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const calculationId = searchParams.get('calculation_id');
    const tier = searchParams.get('tier') as 'essential' | 'professional' | 'strategic';

    if (sessionId && calculationId && tier) {
      setPaymentDetails({
        sessionId,
        calculationId,
        tier
      });
    } else {
      setError('Missing payment information');
    }
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-lime mx-auto mb-4"></div>
          <p className="text-white/70">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-navy-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">✕</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Payment Error</h1>
          <p className="text-white/70 mb-6">{error || 'Something went wrong with your payment'}</p>
          <Link href="/dashboard" className="btn-primary">
            Return to Calculator
          </Link>
        </div>
      </div>
    );
  }

  const tierConfig = TIER_BENEFITS[paymentDetails.tier];

  return (
    <div className="min-h-screen bg-navy-black">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-20 h-20 bg-electric-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-electric-lime" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Thank you for your purchase. Your {tierConfig.name} analysis is now ready.
          </p>
        </div>

        {/* Payment Details */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className={`glass-panel p-8 border-2 ${tierConfig.borderColor} ${tierConfig.bgColor}`}>
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Service:</span>
                <span className={`font-bold ${tierConfig.color}`}>{tierConfig.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Amount Paid:</span>
                <span className="font-bold text-white">{tierConfig.price} SGD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Session ID:</span>
                <span className="font-mono text-sm text-white/60">{paymentDetails.sessionId.slice(-12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Calculation ID:</span>
                <span className="font-mono text-sm text-white/60">{paymentDetails.calculationId.slice(-12)}</span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="glass-panel p-8">
            <h2 className="text-2xl font-bold text-white mb-6">What's Included</h2>
            <ul className="space-y-3">
              {tierConfig.features.map((feature, index) => (
                <li key={index} className="flex items-start text-white/80">
                  <CheckCircle className="w-5 h-5 text-electric-lime mr-3 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto mt-12 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/dashboard?calculation_id=${paymentDetails.calculationId}`} className="btn-primary justify-center">
              <Download className="w-5 h-5 mr-2" />
              View Analysis
            </Link>
            
            <button className="btn-secondary justify-center">
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
            
            {paymentDetails.tier === 'strategic' && (
              <button className="btn-secondary justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Call
              </button>
            )}
            
            <Link href="/" className="btn-secondary justify-center">
              <Users className="w-5 h-5 mr-2" />
              New Analysis
            </Link>
          </div>

          {/* Next Steps */}
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-white mb-2">Immediate Access</h4>
                <p className="text-white/70 text-sm mb-3">
                  Your detailed analysis is now available in your dashboard. Download the PDF report for your records.
                </p>
              </div>
              
              {paymentDetails.tier === 'professional' || paymentDetails.tier === 'strategic' ? (
                <div>
                  <h4 className="font-bold text-white mb-2">Grant Research</h4>
                  <p className="text-white/70 text-sm mb-3">
                    We'll email you a curated list of relevant grants and funding opportunities within 24 hours.
                  </p>
                </div>
              ) : null}

              {paymentDetails.tier === 'strategic' && (
                <>
                  <div>
                    <h4 className="font-bold text-white mb-2">Strategy Consultation</h4>
                    <p className="text-white/70 text-sm mb-3">
                      Schedule your 30-minute strategy call with our IP experts using the button above.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Ongoing Support</h4>
                    <p className="text-white/70 text-sm mb-3">
                      You have 30 days of email support included. Contact us at support@bluelicht.ip
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="glass-panel p-6 text-center">
            <p className="text-white/70 mb-4">Questions about your analysis?</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="mailto:support@bluelicht.ip" className="flex items-center text-electric-lime hover:text-electric-lime/80">
                <Mail className="w-4 h-4 mr-2" />
                support@bluelicht.ip
              </a>
              {paymentDetails.tier === 'strategic' && (
                <a href="tel:+6591234567" className="flex items-center text-electric-lime hover:text-electric-lime/80">
                  <Phone className="w-4 h-4 mr-2" />
                  +65 9123 4567
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-electric-lime mb-4"></div>
          <p className="text-white/70">Loading payment confirmation...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 