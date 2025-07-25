import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateBasicPatentCosts } from '@/lib/costCalculations';
import { generateInsights } from '@/lib/aiInsights';
import { PatentCalculationInput } from '@/types/calculationTypes';

// Initialize Supabase client conditionally
const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    const { calculationId, paymentId } = await request.json();
    
    // Validate required fields
    if (!calculationId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields: calculationId and paymentId' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured - demo mode only' },
        { status: 503 }
      );
    }
    
    // Retrieve the calculation from database
    const { data: calculation, error } = await supabase
      .from('user_calculations')
      .select('*')
      .eq('id', calculationId)
      .single();
    
    if (error || !calculation) {
      return NextResponse.json(
        { error: 'Calculation not found' },
        { status: 404 }
      );
    }
    
    // Verify payment status (simplified here)
    // In a real implementation, you'd verify with payment provider API
    
    // Reconstruct input from stored calculation
    const input: PatentCalculationInput = {
      industry: calculation.industry_sector || 'Technology',
      solutionDescription: calculation.business_description || 'Innovative solution',
      jurisdictions: calculation.jurisdictions,
      solutionComplexity: 'Complex',
      protectionDuration: 20,
      businessDescription: calculation.business_description,
      estimatedClaims: calculation.claim_count || 10,
      includeLegalAgentFees: true,
      includeSearchFees: true,
      includeTranslationFees: true
    };
    
    // Calculate detailed costs (for demo, we'll use the basic calculation)
    const detailedResult = await calculateBasicPatentCosts(input);
    
    // Generate AI insights with strategic context
    const strategicContext = {
      industry: calculation.industry_sector,
      businessStage: calculation.business_stage,
      companyName: calculation.company_name,
      pressingQuestion: calculation.pressing_question
    };
    
    const aiInsights = await generateInsights(detailedResult, input.businessDescription, strategicContext);
    
    // Update calculation with detailed results and payment info
    const { error: updateError } = await supabase
      .from('user_calculations')
      .update({
        detailed_result: detailedResult,
        ai_insights: aiInsights,
        payment_id: paymentId,
        payment_status: 'completed',
        upgraded_at: new Date().toISOString()
      })
      .eq('id', calculationId);
    
    if (updateError) {
      console.error('Error updating calculation:', updateError);
    }
    
    // Return detailed results
    return NextResponse.json({
      success: true,
      detailedResult,
      aiInsights
    });
    
  } catch (error) {
    console.error('Error generating detailed costs:', error);
    return NextResponse.json(
      { error: 'Failed to generate detailed costs' },
      { status: 500 }
    );
  }
} 