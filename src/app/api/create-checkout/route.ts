import { NextRequest, NextResponse } from 'next/server';

// Three-tier pricing structure for Singapore Dollars (Demo Mode)
const PRICING_TIERS = {
  essential: {
    amount: 4900, // in cents
    name: 'Essential Analysis',
    features: ['Detailed cost breakdown', 'Basic IP insights', 'PDF report']
  },
  professional: {
    amount: 7900, // in cents
    name: 'Professional Analysis',
    features: ['Everything in Essential', 'Competitive analysis', 'Grant opportunities', 'Priority support']
  },
  strategic: {
    amount: 14900, // in cents
    name: 'Strategic Consultation',
    features: ['Everything in Professional', '30-min strategy call', 'Custom recommendations', 'Filing roadmap']
  }
} as const;

export async function POST(request: NextRequest) {
  try {
    const { calculationId, email, tier = 'essential' } = await request.json();
    
    // Validate required fields
    if (!calculationId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: calculationId and email' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!PRICING_TIERS[tier as keyof typeof PRICING_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      );
    }

    // Return demo response (no Stripe integration)
    console.log('Demo mode - returning mock payment response');
    const mockSessionId = `demo_${Date.now()}_${calculationId}`;
    return NextResponse.json({
      success: true,
      sessionId: mockSessionId,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/dashboard/payment-demo?session_id=${mockSessionId}&tier=${tier}`,
      message: 'Demo mode - no actual payment will be processed',
      tier,
      amount: PRICING_TIERS[tier as keyof typeof PRICING_TIERS].amount,
      currency: 'SGD'
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 