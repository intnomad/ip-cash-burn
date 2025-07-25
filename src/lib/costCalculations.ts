// src/lib/costCalculations.ts

import { PatentCalculationInput, DetailedCostBreakdown, BasicCostResult } from '../types/calculationTypes';
import { supabase, isSupabaseConfigured } from './supabase';
import { getPatentFees, suggestComplexityFromIndustry } from './patentFeeData';

/**
 * Calculate basic patent costs (total only) based on user inputs
 * This is shown before the user pays
 */
export async function calculateBasicPatentCosts(input: PatentCalculationInput): Promise<BasicCostResult> {
  try {
    const { 
      jurisdictions, 
      industry, 
      solutionDescription,
      businessDescription,
      protectionDuration,
      estimatedClaims,
      // Fee inclusion toggles with defaults
      includeLegalAgentFees = true,
      includeSearchFees = true,
      includeTranslationFees = true
    } = input;
    
    let totalCost = 0;
    const jurisdictionTotals: Record<string, number> = {};
    const currencyByJurisdiction: Record<string, string> = {
      'USPTO': 'USD',
      'EPO': 'USD', // Converting to USD for consistency
      'IPOS': 'USD'
    };
    
    // Determine complexity if not provided
    const complexity = input.solutionComplexity || (industry ? suggestComplexityFromIndustry(industry) : 'Simple');
    
    // Process each selected jurisdiction
    for (const jurisdiction of jurisdictions) {
      let jurisdictionTotal = 0;
      
      // Get fee structure from lookup table
      const feeStructure = getPatentFees(jurisdiction, 'patent', complexity);
      
      if (feeStructure) {
        // Start with official fees (filing, drawing, office action, maintenance)
        jurisdictionTotal = feeStructure.filingFeeUSD + 
                           feeStructure.drawingFeeUSD + 
                           feeStructure.officeActionUSD + 
                           feeStructure.maintenance20YrUSD;
        
        // Add search fees if included
        if (includeSearchFees) {
          jurisdictionTotal += feeStructure.searchFeeUSD;
        }
        
        // Add legal/agent fees if included (combined in the data)
        if (includeLegalAgentFees) {
          jurisdictionTotal += feeStructure.legalAgentFeeUSD;
        }
        
        // Add translation fees if included
        if (includeTranslationFees && feeStructure.translationUSD > 0) {
          jurisdictionTotal += feeStructure.translationUSD;
        }
      } else {
        // Fallback if no fee structure found
        jurisdictionTotal = 15000;
      }
      
      jurisdictionTotals[jurisdiction] = Math.round(jurisdictionTotal);
      totalCost += jurisdictionTotal;
    }
    
    // Return basic result
    return {
      totalCost: Math.round(totalCost),
      jurisdictionTotals,
      currencyByJurisdiction,
      calculationDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating patent costs:', error);
    throw new Error('Failed to calculate patent costs');
  }
}

/**
 * Calculate detailed patent costs with full breakdown
 * This is shown after the user pays
 */
export async function calculateDetailedPatentCosts(input: PatentCalculationInput): Promise<DetailedCostBreakdown> {
  try {
    const { 
      jurisdictions, 
      industry,
      solutionDescription,
      businessDescription,
      protectionDuration,
      estimatedClaims,
      // Fee inclusion toggles with defaults
      includeLegalAgentFees = true,
      includeSearchFees = true,
      includeTranslationFees = true
    } = input;
    
    const basicResult = await calculateBasicPatentCosts(input);
    const costBreakdown: Record<string, any> = {};
    const yearByYearCosts: Record<string, Record<number, number>> = {};
    const potentialSavings: Record<string, any> = {};
    
    // Determine complexity if not provided
    const complexity = input.solutionComplexity || (industry ? suggestComplexityFromIndustry(industry) : 'Simple');
    
    // Get grant programs that might apply
    const { data: grantPrograms } = await supabase
      .from('grant_programs')
      .select('*')
      .eq('is_active', true)
      .filter('eligibility_criteria', 'cs', `{"industry": "${industry}"}`)
      .order('subsidy_percentage', { ascending: false });
    
    // Process each jurisdiction for detailed breakdown
    for (const jurisdiction of jurisdictions) {
      costBreakdown[jurisdiction] = {
        preGrant: {},
        postGrant: {},
        translation: {},
        search: {},
        legalAgent: {}
      };
      yearByYearCosts[jurisdiction] = {};
      
      // Initialize year-by-year costs for full 20-year period
      for (let year = 1; year <= protectionDuration; year++) {
        yearByYearCosts[jurisdiction][year] = 0;
      }
      
      // Get fee structure from lookup table
      const feeStructure = getPatentFees(jurisdiction, 'patent', complexity);
      
      if (feeStructure) {
        // Pre-grant fees breakdown
        costBreakdown[jurisdiction].preGrant['Filing Fee'] = feeStructure.filingFeeUSD;
        costBreakdown[jurisdiction].preGrant['Drawing Fee'] = feeStructure.drawingFeeUSD;
        costBreakdown[jurisdiction].preGrant['Office Action Response'] = feeStructure.officeActionUSD;
        
        // Post-grant fees (maintenance over 20 years)
        costBreakdown[jurisdiction].postGrant['Maintenance Fees (20 years)'] = feeStructure.maintenance20YrUSD;
        
        // Search fees (toggleable)
        if (includeSearchFees) {
          costBreakdown[jurisdiction].search['Patent Search & Examination'] = feeStructure.searchFeeUSD;
        }
        
        // Distribute fees across years (base fees)
        yearByYearCosts[jurisdiction][1] = feeStructure.filingFeeUSD + 
                                          feeStructure.drawingFeeUSD;
        
        if (includeSearchFees) {
          yearByYearCosts[jurisdiction][1] += feeStructure.searchFeeUSD;
        }
        
        yearByYearCosts[jurisdiction][2] = feeStructure.officeActionUSD;
        
        // Distribute maintenance fees across years (jurisdiction-specific)
        const maintenancePerYear = feeStructure.maintenance20YrUSD / 20;
        for (let year = 4; year <= 20; year++) {
          yearByYearCosts[jurisdiction][year] = maintenancePerYear;
        }
        
        // Add combined legal & agent fees if included
        if (includeLegalAgentFees) {
          costBreakdown[jurisdiction].legalAgent['Patent Attorney & Agent Services'] = feeStructure.legalAgentFeeUSD;
          yearByYearCosts[jurisdiction][1] = (yearByYearCosts[jurisdiction][1] || 0) + Math.round(feeStructure.legalAgentFeeUSD * 0.7);
          yearByYearCosts[jurisdiction][2] = (yearByYearCosts[jurisdiction][2] || 0) + Math.round(feeStructure.legalAgentFeeUSD * 0.3);
        }
        
        // Add translation fees if included
        if (includeTranslationFees && feeStructure.translationUSD > 0) {
          costBreakdown[jurisdiction].translation['Document Translation'] = feeStructure.translationUSD;
          yearByYearCosts[jurisdiction][2] = (yearByYearCosts[jurisdiction][2] || 0) + feeStructure.translationUSD;
        }
      }
      
      // Calculate potential savings (simplified for now)
      potentialSavings[jurisdiction] = [];
      
      if (basicResult.jurisdictionTotals[jurisdiction]) {
        potentialSavings[jurisdiction].push({
          type: 'complexity_optimization',
          description: 'Optimizing invention complexity categorization could reduce fees',
          potentialSaving: basicResult.jurisdictionTotals[jurisdiction] * 0.15,
          requirementDescription: 'Work with patent attorney to properly categorize invention complexity'
        });
      }
    }
    
    // Combine everything into detailed result
    return {
      ...basicResult,
      costBreakdown,
      yearByYearCosts,
      potentialSavings,
      estimatedAttorneyFees: true,
      includedLegalAgentFees: includeLegalAgentFees,
      includedSearchFees: includeSearchFees,
      includedTranslationFees: includeTranslationFees,
      patentMaintenanceStrategy: generateMaintenanceStrategy(yearByYearCosts, protectionDuration),
      calculationNotes: [
        "All amounts are based on current market rates and official fee schedules.",
        "Fees are adjusted based on invention complexity and jurisdiction requirements.",
        `Patent complexity: ${complexity}`,
        ...(includeLegalAgentFees ? ["Legal & agent fees included based on market rates"] : []),
        ...(includeSearchFees ? ["Patent search fees included"] : []),
        ...(includeTranslationFees ? ["Translation fees included for international filings"] : []),
        "Actual costs may vary based on specific invention details and prosecution complexity."
      ]
    };
  } catch (error) {
    console.error('Error calculating detailed patent costs:', error);
    throw new Error('Failed to calculate detailed patent costs');
  }
}

/**
 * Generate maintenance strategy recommendations based on costs
 */
function generateMaintenanceStrategy(
  yearByYearCosts: Record<string, Record<number, number>>, 
  protectionDuration: number
): string {
  // This would be more sophisticated in a real implementation
  const highCostYears: number[] = [];
  const jurisdictions = Object.keys(yearByYearCosts);
  
  // Find years with notably high costs
  for (let year = 1; year <= protectionDuration; year++) {
    let totalForYear = 0;
    
    for (const jurisdiction of jurisdictions) {
      totalForYear += yearByYearCosts[jurisdiction][year] || 0;
    }
    
    if (totalForYear > 1000) { // Arbitrary threshold
      highCostYears.push(year);
    }
  }
  
  if (highCostYears.length > 0) {
    return `Consider budgeting ahead for years ${highCostYears.join(', ')} which have higher maintenance costs. Review the commercial value of your patent before paying renewals in these years.`;
  } else {
    return "Your patent maintenance costs are relatively stable across years. Set up a renewal reminder system to avoid missing deadlines.";
  }
}

/**
 * Store calculation result in database
 */
export async function storeCalculationResult(
  email: string,
  input: PatentCalculationInput,
  basicResult: BasicCostResult
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('user_calculations')
      .insert([
        {
          user_email: email,
          calculation_name: `Patent in ${input.jurisdictions.join(', ')}`,
          ip_type: 'patent',
          jurisdictions: input.jurisdictions,
          entity_type: 'standard',
          industry_sector: input.industry,
          business_description: input.businessDescription,
          duration_years: input.protectionDuration,
          claim_count: 10,
          page_count: 30,
          basic_result: basicResult,
          has_paid: false
        }
      ])
      .select('id');
    
    if (error) throw error;
    
    return data?.[0]?.id || '';
  } catch (error) {
    console.error('Error storing calculation result:', error);
    throw new Error('Failed to store calculation result');
  }
}

/**
 * Update calculation with detailed results after payment
 */
export async function updateCalculationAfterPayment(
  calculationId: string,
  paymentId: string,
  detailedResult: DetailedCostBreakdown,
  aiInsights: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_calculations')
      .update({
        detailed_result: detailedResult,
        ai_insights: aiInsights,
        has_paid: true,
        payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', calculationId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating calculation after payment:', error);
    throw new Error('Failed to update calculation after payment');
  }
}