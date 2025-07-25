import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessDescription, ipType = 'patent' } = await request.json();
    
    // Validate required fields
    if (!businessDescription || businessDescription.trim().length < 10) {
      return NextResponse.json(
        { error: 'Business description must be at least 10 characters long' },
        { status: 400 }
      );
    }
    
    // Return default suggestions based on common patterns
    const suggestions = {
      industrySector: 'Technology & Software',
      entityType: 'standard',
      claimCount: 10,
      pageCount: 30,
      suggestedJurisdictions: ['USPTO'],
      reasoning: 'Default suggestions based on common filing patterns'
    };

    // Simple business description analysis for better defaults
    const description = businessDescription.toLowerCase();
    
    if (description.includes('software') || description.includes('app') || description.includes('digital')) {
      suggestions.industrySector = 'Technology & Software';
      suggestions.claimCount = 15;
      suggestions.pageCount = 25;
    } else if (description.includes('medical') || description.includes('health') || description.includes('pharmaceutical')) {
      suggestions.industrySector = 'Healthcare & Medical';
      suggestions.claimCount = 20;
      suggestions.pageCount = 40;
      suggestions.suggestedJurisdictions = ['USPTO', 'EPO'];
    } else if (description.includes('manufacturing') || description.includes('mechanical') || description.includes('device')) {
      suggestions.industrySector = 'Manufacturing & Engineering';
      suggestions.claimCount = 12;
      suggestions.pageCount = 35;
    }
    
    return NextResponse.json({
      success: true,
      suggestions
    });
    
  } catch (error) {
    console.error('Error generating form suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate form suggestions' },
      { status: 500 }
    );
  }
} 