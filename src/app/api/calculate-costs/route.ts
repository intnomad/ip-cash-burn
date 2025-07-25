// app/api/calculate-costs/route.ts
// API endpoint for IP cost calculations (patents, trademarks, designs)

import { NextRequest, NextResponse } from 'next/server';
import { calculateBasicPatentCosts, calculateDetailedPatentCosts, storeCalculationResult } from '@/lib/costCalculations';
import { PatentCalculationInput } from '@/types/calculationTypes';
import { supabaseAdmin } from '@/lib/supabase';

// Define tier-based feature access
const TIER_FEATURES = {
  free: {
    name: 'Free Preview',
    features: ['basic_total_only'],
    maxJurisdictions: 3
  },
  essential: {
    name: 'Essential',
    price: 4900, // S$49 in cents
    features: ['detailed_breakdown', 'basic_insights', 'year_timeline', 'entity_discounts', 'pdf_export'],
    maxJurisdictions: 5
  },
  professional: {
    name: 'Professional', 
    price: 7900, // S$79 in cents
    features: ['all_essential', 'competitive_analysis', 'grant_opportunities', 'priority_recommendations', 'trade_secrets'],
    maxJurisdictions: 10
  },
  strategic: {
    name: 'Strategic',
    price: 14900, // S$149 in cents
    features: ['all_professional', 'strategy_call', 'valuation_analysis', 'custom_strategy', 'email_support'],
    maxJurisdictions: 20
  }
} as const;

interface TrademarkInput {
  jurisdictions: string[];
  trademarkClasses?: number;
}

// Basic trademark cost estimation (placeholder - would need real data)
function calculateBasicTrademarkCosts(input: TrademarkInput) {
  const baseTrademarkCosts = {
    USPTO: { filing: 350, classes: input.trademarkClasses || 1 },
    EPO: { filing: 850, classes: input.trademarkClasses || 1 },
    IPOS: { filing: 240, classes: input.trademarkClasses || 1 }
  };

  const results = input.jurisdictions.map((jurisdiction: string) => {
    const costs = baseTrademarkCosts[jurisdiction as keyof typeof baseTrademarkCosts];
    if (!costs) return null;

    const totalCost = costs.filing * costs.classes;
    return {
      jurisdiction,
      totalCost,
      breakdown: {
        filing: costs.filing * costs.classes,
        maintenance: []
      }
    };
  }).filter(Boolean);

  return {
    results,
    totalCost: results.reduce((sum: number, r: any) => sum + r.totalCost, 0),
    ipType: 'trademark'
  };
}

interface DesignInput {
  jurisdictions: string[];
}

// Basic design cost estimation (placeholder)
function calculateBasicDesignCosts(input: DesignInput) {
  const baseDesignCosts = {
    USPTO: { filing: 760 },
    EPO: { filing: 350 },
    IPOS: { filing: 180 }
  };

  const results = input.jurisdictions.map((jurisdiction: string) => {
    const costs = baseDesignCosts[jurisdiction as keyof typeof baseDesignCosts];
    if (!costs) return null;

    return {
      jurisdiction,
      totalCost: costs.filing,
      breakdown: {
        filing: costs.filing,
        maintenance: []
      }
    };
  }).filter(Boolean);

  return {
    results,
    totalCost: results.reduce((sum: number, r: any) => sum + r.totalCost, 0),
    ipType: 'design'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Enhanced validation to support different IP types and tiers
    const { 
      ipType = 'patent',
      jurisdictions, 
      durationYears, 
      industrySector, 
      businessDescription,
      trademarkClasses,
      isWordMark,
      detailed = false,
      userEmail,
      tier = 'free',
      calculationId // For retrieving existing calculations
    } = body;
    
    // Validate IP type
    if (!['patent', 'trademark', 'design'].includes(ipType)) {
      return NextResponse.json(
        { error: 'Invalid IP type. Supported types: patent, trademark, design' },
        { status: 400 }
      );
    }
    
    if (!jurisdictions || !Array.isArray(jurisdictions) || jurisdictions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: jurisdictions (must be non-empty array)' },
        { status: 400 }
      );
    }

    // Tier-based jurisdiction limits
    const tierConfig = TIER_FEATURES[tier as keyof typeof TIER_FEATURES];
    if (!tierConfig) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    if (jurisdictions.length > tierConfig.maxJurisdictions) {
      return NextResponse.json(
        { error: `Tier ${tierConfig.name} allows maximum ${tierConfig.maxJurisdictions} jurisdictions` },
        { status: 400 }
      );
    }

    // Patent-specific validation
    if (ipType === 'patent') {
      if (!durationYears || durationYears < 1 || durationYears > 20) {
        return NextResponse.json(
          { error: 'Duration years must be between 1 and 20' },
          { status: 400 }
        );
      }
    }

    // Trademark-specific validation
    if (ipType === 'trademark') {
      if (!trademarkClasses || trademarkClasses < 1 || trademarkClasses > 45) {
        return NextResponse.json(
          { error: 'Trademark classes must be between 1 and 45' },
          { status: 400 }
        );
      }
    }

    const validJurisdictions = ['USPTO', 'EPO', 'IPOS'];
    const invalidJurisdictions = jurisdictions.filter((jurisdiction: string) => !validJurisdictions.includes(jurisdiction));
    
    if (invalidJurisdictions.length > 0) {
      return NextResponse.json(
        { error: `Invalid jurisdictions: ${invalidJurisdictions.join(', ')}. Supported: ${validJurisdictions.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare calculation input
    const calculationInput = {
      ipType,
      jurisdictions,
      durationYears: ipType === 'patent' ? durationYears : undefined,
      industrySector,
      businessDescription,
      trademarkClasses: ipType === 'trademark' ? trademarkClasses : undefined,
      isWordMark: ipType === 'trademark' ? isWordMark : undefined
    };

    let result: any; // TODO: Type this properly based on calculation type

    // Calculate based on IP type
    if (ipType === 'patent') {
      // Existing patent calculation logic
      if (detailed || tier !== 'free') {
        // Enhanced calculation with tier-appropriate features
        const patentInput: PatentCalculationInput = {
          industry: industrySector || 'Technology',
          solutionDescription: businessDescription || 'Innovative solution',
          jurisdictions,
          solutionComplexity: 'Complex',
          protectionDuration: 20,
          businessDescription,
          estimatedClaims: 10,
          includeLegalAgentFees: true,
          includeSearchFees: true,
          includeTranslationFees: true
        };
        
        if (tier === 'essential' || tier === 'professional' || tier === 'strategic') {
          result = await calculateDetailedPatentCosts(patentInput);
        } else {
          result = await calculateBasicPatentCosts(patentInput);
        }
      } else {
        // Basic free preview
        const patentInput: PatentCalculationInput = {
          industry: industrySector || 'Technology',
          solutionDescription: businessDescription || 'Innovative solution',
          jurisdictions,
          solutionComplexity: 'Complex',
          protectionDuration: 20,
          businessDescription,
          estimatedClaims: 10,
          includeLegalAgentFees: true,
          includeSearchFees: true,
          includeTranslationFees: true
        };
        result = await calculateBasicPatentCosts(patentInput);
      }
    } else if (ipType === 'trademark') {
      result = calculateBasicTrademarkCosts(calculationInput);
    } else if (ipType === 'design') {
      result = calculateBasicDesignCosts(calculationInput);
    } else {
      throw new Error(`Unsupported IP type: ${ipType}`);
    }

    if (!result) {
      throw new Error('Failed to calculate costs');
    }

    // Add tier-specific metadata
    const responseData = {
      ...result,
      tier,
      tierFeatures: tierConfig.features,
      ipType,
      metadata: {
        calculationDate: new Date().toISOString(),
        tierUsed: tier,
        featuresAvailable: tierConfig.features
      }
    };

    // Store calculation if user email is provided
    let storedCalculationId: string | undefined;
    if (userEmail && tier !== 'free') {
      try {
        const patentInput: PatentCalculationInput = {
          industry: industrySector || 'Technology',
          solutionDescription: businessDescription || 'Innovative solution',
          jurisdictions,
          solutionComplexity: 'Complex',
          protectionDuration: 20,
          businessDescription,
          estimatedClaims: 10,
          includeLegalAgentFees: true,
          includeSearchFees: true,
          includeTranslationFees: true
        };
        storedCalculationId = await storeCalculationResult(userEmail, patentInput, result);
      } catch (storeError) {
        console.error('Failed to store calculation:', storeError);
        // Don't fail the entire request if storage fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: responseData,
      type: tier === 'free' ? 'preview' : tier,
      calculationId: storedCalculationId,
      tierInfo: {
        current: tier,
        available: Object.keys(TIER_FEATURES),
        features: tierConfig
      }
    });

  } catch (error) {
    console.error('Cost calculation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate IP costs', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for retrieving past calculations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const calculationId = searchParams.get('calculationId');
    
    if (!userEmail && !calculationId) {
      return NextResponse.json(
        { error: 'Either userEmail or calculationId is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('user_calculations').select('*');
    
    if (calculationId) {
      query = query.eq('id', calculationId);
    } else if (userEmail) {
      query = query.eq('user_email', userEmail).order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data: calculationId ? data?.[0] : data
    });
    
  } catch (error) {
    console.error('Error retrieving calculations:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve calculations', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}