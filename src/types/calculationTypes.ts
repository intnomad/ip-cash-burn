// src/types/calculationTypes.ts

export interface PatentCalculationInput {
  // Core fields
  industry: string;
  solutionDescription: string;
  jurisdictions: string[];
  solutionComplexity: 'Simple' | 'Complex' | 'Cutting-Edge' | 'Software/Biotech';
  protectionDuration: 10 | 15 | 20;
  filingStrategy?: 'Direct Filing' | 'PCT Route';
  
  // Optional fields for enhanced calculations
  businessDescription?: string;
  estimatedClaims?: number;
  includeLegalAgentFees?: boolean;
  includeSearchFees?: boolean;
  includeTranslationFees?: boolean;
}

export interface TimelineEstimate {
  filingToGrant: {
    min: number;
    max: number;
    average: number;
  };
  totalTimeline: {
    min: number;
    max: number;
    average: number;
  };
  prosecutionDelays: number;
  industryFactor: number;
}

export interface PatentCostResult {
  totalCost: number;
  jurisdictionCosts: Record<string, {
    totalLifecycleCost: number;
    filingToGrantCost: number;
    renewalCosts: number;
    breakdown: {
      officialFees: number;
      professionalFees: number;
      additionalCosts: number;
    };
  }>;
  timeline: TimelineEstimate;
  filingStrategyComparison?: {
    directFiling: {
      totalCost: number;
      timeline: TimelineEstimate;
    };
    pctRoute: {
      totalCost: number;
      timeline: TimelineEstimate;
    };
  };
  calculationDate: string;
  currency: string; // Always USD
}

export interface DetailedPatentCostBreakdown extends PatentCostResult {
  costBreakdown: Record<string, {
    officialFees: {
      filing: number;
      search: number;
      examination: number;
      grant: number;
      extraClaims: number;
      renewal: number;
    };
    professionalFees: {
      baseFee: number;
      complexityMultiplier: number;
      jurisdictionMultiplier: number;
      prosecutionMultiplier: number;
      total: number;
    };
    additionalCosts: {
      drawings: number;
      translations: number;
      filing: number;
      miscellaneous: number;
    };
  }>;
  yearByYearCosts: Record<string, Record<number, number>>;
  potentialSavings: Record<string, Array<{
    type: string;
    name?: string;
    description: string;
    potentialSaving: number;
    requirementDescription: string;
    applicationUrl?: string;
  }>>;
  calculationNotes: string[];
}

export interface BasicCostResult {
  totalCost: number;
  jurisdictionTotals: Record<string, number>;
  currencyByJurisdiction: Record<string, string>;
  calculationDate: string;
}

export interface DetailedCostResult extends BasicCostResult {
  costBreakdown: Record<string, {
    preGrant: Record<string, number>;
    postGrant: Record<string, number>;
    translation: Record<string, number>;
    search: Record<string, number>;
    legalAgent: Record<string, number>;
  }>;
  yearByYearCosts: Record<string, Record<number, number>>;
  potentialSavings: Record<string, Array<{
    type: string;
    name?: string;
    description: string;
    potentialSaving: number;
    requirementDescription: string;
    applicationUrl?: string;
  }>>;
  estimatedAttorneyFees: boolean;
  includedLegalAgentFees?: boolean;
  includedSearchFees?: boolean;
  includedTranslationFees?: boolean;
  patentMaintenanceStrategy: string;
  calculationNotes: string[];
}

export interface DetailedCostBreakdown extends BasicCostResult {
  costBreakdown: Record<string, {
    preGrant: Record<string, number>;
    postGrant: Record<string, number>;
    translation: Record<string, number>;
    search: Record<string, number>;
    legalAgent: Record<string, number>;
  }>;
  yearByYearCosts: Record<string, Record<number, number>>;
  potentialSavings: Record<string, Array<{
    type: string;
    name?: string;
    description: string;
    potentialSaving: number;
    requirementDescription: string;
    applicationUrl?: string;
  }>>;
  estimatedAttorneyFees: boolean;
  includedLegalAgentFees?: boolean;
  includedSearchFees?: boolean;
  includedTranslationFees?: boolean;
  patentMaintenanceStrategy: string;
  calculationNotes: string[];
}

export interface EligibilityCriteria {
  entity_size?: string[];
  industry_sectors?: string[];
  min_revenue?: number;
  max_revenue?: number;
  employee_count?: number;
  geographic_restrictions?: string[];
  other_requirements?: string[];
}

export interface GrantProgram {
  id: string;
  program_name: string;
  country: string;
  description: string;
  subsidy_percentage: number;
  max_subsidy_amount?: number;
  eligibility_criteria: EligibilityCriteria;
  application_url?: string;
  is_active: boolean;
}

export interface ExchangeRate {
  currency_from: string;
  currency_to: string;
  rate: number;
  effective_date: string;
}

export interface PatentFee {
  id: string;
  fee_description: string;
  fee_category: string;
  lifecycle_stage: 'pre-grant' | 'post-grant';
  year_due?: number;
  fee_amount?: number;
  standard_fee?: number;
  small_entity_fee?: number;
  micro_entity_fee?: number;
  currency: string;
  is_required: boolean;
  claims_threshold?: number;
  page_threshold?: number;
  expiration_date?: string;
}

export interface AIInsights {
  strategic_recommendations?: string[];
  cost_optimization_tips?: string[];
  timeline_insights?: string[];
  risk_analysis?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  competitive_landscape?: string;
  market_analysis?: string;
}

export interface UserCalculation {
  id: string;
  user_email: string;
  calculation_name: string;
  ip_type: string;
  jurisdictions: string[];
  entity_type: string;
  industry_sector?: string;
  business_description?: string;
  duration_years: number;
  claim_count: number;
  page_count: number;
  basic_result: BasicCostResult;
  detailed_result?: DetailedCostBreakdown;
  ai_insights?: AIInsights;
  has_paid: boolean;
  payment_id?: string;
  created_at: string;
  updated_at: string;
} 