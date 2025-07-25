'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, CreditCard, ArrowRight, Info } from 'lucide-react';

interface DemoPaymentDetails {
  sessionId: string;
  tier: 'essential' | 'professional' | 'strategic';
}

const TIER_INFO = {
  essential: {
    name: 'Essential Analysis',
    price: 'S$49',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  professional: {
    name: 'Professional Analysis',
    price: 'S$79',
    color: 'text-electric-lime',
    bgColor: 'bg-electric-lime/10',
    borderColor: 'border-electric-lime/30'
  },
  strategic: {
    name: 'Strategic Consultation',
    price: 'S$149',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  }
};

// Component that uses searchParams - needs to be wrapped in Suspense
function PaymentDemoContent() {
  const [paymentDetails, setPaymentDetails] = useState<DemoPaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const tier = searchParams.get('tier') as 'essential' | 'professional' | 'strategic';

    if (sessionId && tier && TIER_INFO[tier]) {
      setPaymentDetails({ sessionId, tier });
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleStartPayment = () => {
    setShowPaymentFlow(true);
    setPaymentStep('form');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('success');
    }, 2000);
  };

  const handleCompleteDemoPayment = () => {
    if (paymentDetails) {
      const successUrl = `/dashboard/payment-success?session_id=${paymentDetails.sessionId}&calculation_id=demo_calc_${Date.now()}&tier=${paymentDetails.tier}`;
      window.location.href = successUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-lime mx-auto mb-4"></div>
          <p className="text-white/70">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-navy-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Payment Link</h1>
          <p className="text-white/70 mb-6">The payment link is invalid or has expired.</p>
          <Link href="/dashboard" className="btn-primary">
            Return to Calculator
          </Link>
        </div>
      </div>
    );
  }

  const tierConfig = TIER_INFO[paymentDetails.tier];

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-navy-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-electric-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-electric-lime" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Demo Payment Complete!</h1>
          <p className="text-white/70 mb-8">
            This was a demonstration of the payment flow. In production, you would be charged {tierConfig.price} SGD.
          </p>
          <button onClick={handleCompleteDemoPayment} className="btn-primary w-full">
            <ArrowRight className="w-5 h-5 mr-2" />
            Continue to Results
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-navy-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-electric-lime mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-white mb-4">Processing Payment...</h1>
          <p className="text-white/70">Please wait while we process your demo payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-black">
      <div className="container mx-auto px-4 py-12">
        {/* Demo Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-start">
              <Info className="w-6 h-6 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-2">Demo Mode</h3>
                <p className="text-white/70">
                  This is a demonstration of the payment flow. No actual charges will be made. 
                  In production, secure payment processing would be handled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {!showPaymentFlow ? (
          /* Initial Payment Page */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Complete Your Purchase</h1>
              <p className="text-xl text-white/70">
                Unlock detailed analysis and insights for your IP strategy
              </p>
            </div>

            {/* Order Summary */}
            <div className={`glass-panel p-8 border-2 ${tierConfig.borderColor} ${tierConfig.bgColor} mb-8`}>
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Service:</span>
                  <span className={`font-bold ${tierConfig.color}`}>{tierConfig.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Price:</span>
                  <span className="font-bold text-white">{tierConfig.price} SGD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Processing Fee:</span>
                  <span className="text-white">Included</span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-white">Total:</span>
                    <span className={`font-bold text-xl ${tierConfig.color}`}>{tierConfig.price} SGD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={handleStartPayment} className="btn-primary w-full text-lg py-4">
                <CreditCard className="w-6 h-6 mr-3" />
                Proceed to Demo Payment
              </button>
              
              <Link href="/dashboard" className="btn-secondary w-full justify-center text-lg py-4">
                Cancel and Return
              </Link>
            </div>

            <div className="text-center mt-8">
              <p className="text-white/60 text-sm">
                                  Secure payment processing (Demo Mode)
              </p>
            </div>
          </div>
        ) : (
          /* Demo Payment Form */
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Demo Payment Form</h1>
              <p className="text-white/70">
                                  This simulates the checkout experience
              </p>
            </div>

            <form onSubmit={handleSubmitPayment} className="glass-panel p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Email</label>
                <input
                  type="email"
                  className="input-glass w-full"
                  defaultValue="demo@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Card Number</label>
                <input
                  type="text"
                  className="input-glass w-full"
                  placeholder="4242 4242 4242 4242"
                  defaultValue="4242 4242 4242 4242"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Expiry</label>
                  <input
                    type="text"
                    className="input-glass w-full"
                    placeholder="MM/YY"
                    defaultValue="12/27"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">CVC</label>
                  <input
                    type="text"
                    className="input-glass w-full"
                    placeholder="123"
                    defaultValue="123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Cardholder Name</label>
                <input
                  type="text"
                  className="input-glass w-full"
                  defaultValue="Demo User"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full text-lg py-4">
                <CreditCard className="w-6 h-6 mr-3" />
                Pay {tierConfig.price} SGD (Demo)
              </button>

              <button 
                type="button" 
                onClick={() => setShowPaymentFlow(false)}
                className="btn-secondary w-full justify-center"
              >
                Back to Order Summary
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-white/60 text-xs">
                Demo card numbers - No actual payment will be processed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-electric-lime mb-4"></div>
          <p className="text-white/70">Loading payment demo...</p>
        </div>
      </div>
    }>
      <PaymentDemoContent />
    </Suspense>
  );
} 