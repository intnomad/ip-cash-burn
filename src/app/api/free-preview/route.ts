import { NextRequest, NextResponse } from 'next/server';
import { generateFreeCostPreview } from '@/lib/freeCostPreview';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      ipType = 'patent',
      jurisdictions, 
      industry,
      description,
      companyStage,
      email,
      companyName
    } = body;
    
    // Validate required fields
    if (!jurisdictions || !Array.isArray(jurisdictions) || jurisdictions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: jurisdictions (must be non-empty array)' },
        { status: 400 }
      );
    }
    
    if (!email || !companyName || !industry || !companyStage) {
      return NextResponse.json(
        { error: 'Missing required fields: email, companyName, industry, companyStage' },
        { status: 400 }
      );
    }

    // Provide fallback for description if empty
    const businessDescription = description && description.trim() ? description.trim() : 'General business operations';

    const validJurisdictions = ['USPTO', 'EPO', 'IPOS'];
    const invalidJurisdictions = jurisdictions.filter((jurisdiction: string) => !validJurisdictions.includes(jurisdiction));
    
    if (invalidJurisdictions.length > 0) {
      return NextResponse.json(
        { error: `Invalid jurisdictions: ${invalidJurisdictions.join(', ')}. Supported: ${validJurisdictions.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate free cost preview
    const previewData = await generateFreeCostPreview({
      ipType,
      jurisdictions,
      industry,
      description: businessDescription,
      companyStage,
      email,
      companyName
    });

    return NextResponse.json({
      success: true,
      data: previewData,
      type: 'free_preview',
      metadata: {
        calculationDate: new Date().toISOString(),
        ipType,
        jurisdictions
      }
    });

  } catch (error) {
    console.error('Free preview generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate free cost preview', 
        details: error instanceof Error ? error.message : 'Unknown error',
        data: null
      },
      { status: 500 }
    );
  }
} 