// app/api/calculate-patent-costs/route.ts
// API endpoint for patent cost and timeline calculations

import { NextRequest, NextResponse } from 'next/server';
import { calculatePatentCostsAndTimeline, calculateDetailedPatentCostsAndTimeline } from '@/lib/patentCostCalculations';
import { PatentCalculationInput } from '@/types/calculationTypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      industry,
      solutionDescription,
      jurisdictions, 
      solutionComplexity,
      protectionDuration,
      filingStrategy,
      businessDescription,
      estimatedClaims,
      detailed = false,
      userEmail,
      includeLegalAgentFees = true,
      includeSearchFees = true,
      includeTranslationFees = true
    } = body;
    
    // Validate required fields
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    if (!solutionDescription || solutionDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Solution description is required' },
        { status: 400 }
      );
    }

    if (solutionDescription.length > 500) {
      return NextResponse.json(
        { error: 'Solution description must be 500 characters or less' },
        { status: 400 }
      );
    }

    if (!jurisdictions || !Array.isArray(jurisdictions) || jurisdictions.length === 0) {
      return NextResponse.json(
        { error: 'At least one jurisdiction is required' },
        { status: 400 }
      );
    }

    if (jurisdictions.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 jurisdictions allowed' },
        { status: 400 }
      );
    }

    if (!solutionComplexity || !['Simple', 'Complex', 'Cutting-Edge', 'Software/Biotech'].includes(solutionComplexity)) {
      return NextResponse.json(
        { error: 'Valid solution complexity is required' },
        { status: 400 }
      );
    }

    if (!protectionDuration || ![10, 15, 20].includes(protectionDuration)) {
      return NextResponse.json(
        { error: 'Protection duration must be 10, 15, or 20 years' },
        { status: 400 }
      );
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
    const calculationInput: PatentCalculationInput = {
      industry,
      solutionDescription,
      jurisdictions,
      solutionComplexity,
      protectionDuration,
      filingStrategy,
      businessDescription,
      estimatedClaims: estimatedClaims || 20,
      includeLegalAgentFees,
      includeSearchFees,
      includeTranslationFees
    };

    let result: any;

    // Calculate based on detail level
    if (detailed) {
      result = await calculateDetailedPatentCostsAndTimeline(calculationInput);
    } else {
      result = await calculatePatentCostsAndTimeline(calculationInput);
    }

    if (!result) {
      throw new Error('Failed to calculate patent costs and timeline');
    }

    // Add metadata
    const responseData = {
      ...result,
      metadata: {
        calculationDate: new Date().toISOString(),
        industry,
        solutionComplexity,
        protectionDuration,
        filingStrategy: filingStrategy || (jurisdictions.length <= 2 ? 'Direct Filing' : 'PCT Route'),
        jurisdictionsCount: jurisdictions.length
      }
    };
    
    return NextResponse.json({
      success: true,
      data: responseData,
      type: detailed ? 'detailed' : 'basic'
    });

  } catch (error) {
    console.error('Patent cost calculation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate patent costs and timeline', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 