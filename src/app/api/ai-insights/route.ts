// app/api/ai-insights/route.ts
// API endpoint for generating AI-powered IP strategy insights

import { NextRequest, NextResponse } from 'next/server';
import { generateInsights } from '@/lib/aiInsights';
import { BasicCostResult, DetailedCostBreakdown } from '@/types/calculationTypes';

export async function POST(request: NextRequest) {
  try {
    const { 
      result, 
      businessDescription
    } = await request.json();
    
    if (!result) {
      return NextResponse.json(
        { error: 'Missing result data for insights generation' },
        { status: 400 }
      );
    }
    
    // Generate insights using the simplified API
    const insights = await generateInsights(
      result as BasicCostResult | DetailedCostBreakdown,
      businessDescription
    );
    
    return NextResponse.json({
      success: true,
      insights
    });
    
  } catch (error) {
    console.error('Error generating AI insights:', error);
    // Always return JSON, even on error
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate AI insights',
        insights: [] // Return empty insights array as fallback
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Insights API',
    description: 'Generate AI-powered patent strategy insights',
    features: [
      'Cost comparison analysis',
      'Risk assessment',
      'Market prioritization',
      'Timeline optimization',
      'Budget recommendations'
    ],
    requiredFields: ['calculationData'],
    optionalFields: ['businessDescription', 'sessionId']
  });
}