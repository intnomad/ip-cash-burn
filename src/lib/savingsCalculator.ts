import { PatentCalculationInput, PatentCostResult } from '@/types/calculationTypes';

export interface SavingsBreakdown {
  feeReductions: {
    microEntity: number;
    smallEntity: number;
    onlineFiling: number;
    total: number;
  };
  grants: {
    usGrants: number;
    euGrants: number;
    singaporeGrants: number;
    total: number;
  };
  strategicFiling: {
    pctRoute: number;
    provisionalFiling: number;
    staggeredFiling: number;
    total: number;
  };
  taxBenefits: {
    rndCredits: number;
    patentBox: number;
    innovationIncentives: number;
    total: number;
  };
  totalSavings: number;
  confidenceLevel: 'guaranteed' | 'likely' | 'potential';
}

export interface SavingsDisplay {
  totalSavings: number;
  breakdown: SavingsBreakdown;
  jurisdictionSpecific: Record<string, string[]>;
  guaranteedSavings: number;
  potentialSavings: number;
  confidenceLevel: 'guaranteed' | 'likely' | 'potential';
}

// Fee reduction data
const FEE_REDUCTIONS = {
  'USPTO': {
    microEntity: 0.75, // 75% off official fees
    smallEntity: 0.50, // 50% off official fees
    onlineFiling: 0.10 // 10% online filing discount
  },
  'EPO': {
    sme: 0.30, // 30% SME discount
    onlineFiling: 0.20, // 20% online filing discount
    countryValidation: 2000 // $2K per extra country saved
  },
  'IPOS': {
    onlineFiling: 0.15 // 15% online filing discount
  }
};

// Grant data
const GRANTS = {
  'USPTO': {
    sbir: 50000, // SBIR grants
    sttr: 75000, // STTR grants
    average: 62500
  },
  'EPO': {
    euInnovation: 25000, // EU Innovation grants
    regional: 15000, // Regional development grants
    average: 20000
  },
  'IPOS': {
    ipoGrant: 15000, // IPO grants for local entities
    startupGrant: 10000, // Additional startup grants
    average: 25000
  }
};

// Strategic filing savings
const STRATEGIC_SAVINGS = {
  pctRoute: {
    basePercentage: 0.15, // 15% savings on total costs
    searchReuse: 1500 // $1.5K per jurisdiction for search reuse
  },
  provisionalFiling: {
    simple: 3000,
    complex: 5000,
    cuttingEdge: 8000
  },
  staggeredFiling: {
    perJurisdiction: 3000 // $3K per additional jurisdiction
  }
};

// Tax benefits (percentage of total patent costs)
const TAX_BENEFITS = {
  'USPTO': {
    rndCredit: 0.20, // 20% federal R&D credit
    stateCredit: 0.15, // 15% average state credits
    total: 0.35
  },
  'EPO': {
    patentBox: 0.10, // 10% patent box benefits
    innovationIncentives: 0.12, // 12% innovation incentives
    total: 0.22
  },
  'IPOS': {
    rndDeduction: 0.25, // 25% R&D deduction
    ipDevelopment: 0.05, // 5% IP development incentive
    total: 0.30
  }
};

export function calculateTotalSavings(
  input: PatentCalculationInput, 
  results: PatentCostResult
): SavingsDisplay {
  const breakdown = getSavingsBreakdown(input, results);
  const jurisdictionSpecific = getJurisdictionSpecificSavings(input, results);
  
  // Cap total savings to 50% of total cost (realistic maximum)
  const maxSavings = results.totalCost * 0.5;
  const cappedTotalSavings = Math.min(breakdown.totalSavings, maxSavings);
  
  // Recalculate breakdown proportions to respect the cap
  const savingsRatio = cappedTotalSavings / breakdown.totalSavings;
  const adjustedBreakdown = {
    ...breakdown,
    feeReductions: {
      ...breakdown.feeReductions,
      total: breakdown.feeReductions.total * savingsRatio
    },
    grants: {
      ...breakdown.grants,
      total: breakdown.grants.total * savingsRatio
    },
    strategicFiling: {
      ...breakdown.strategicFiling,
      total: breakdown.strategicFiling.total * savingsRatio
    },
    taxBenefits: {
      rndCredits: 0,
      patentBox: 0,
      innovationIncentives: 0,
      total: 0
    },
    totalSavings: cappedTotalSavings
  };
  
  // Calculate confidence levels
  const guaranteedSavings = adjustedBreakdown.feeReductions.total + adjustedBreakdown.grants.total;
  const potentialSavings = adjustedBreakdown.strategicFiling.total;
  
  const confidenceLevel = guaranteedSavings > 0 ? 'guaranteed' : 
                         potentialSavings > 0 ? 'likely' : 'potential';

  return {
    totalSavings: cappedTotalSavings,
    breakdown: adjustedBreakdown,
    jurisdictionSpecific,
    guaranteedSavings,
    potentialSavings,
    confidenceLevel
  };
}

export function getSavingsBreakdown(
  input: PatentCalculationInput, 
  results: PatentCostResult
): SavingsBreakdown {
  const feeReductions = calculateFeeReductions(input, results);
  const grants = calculateGrants(input, results);
  const strategicFiling = calculateStrategicFilingSavings(input, results);
  const taxBenefits = {
    rndCredits: 0,
    patentBox: 0,
    innovationIncentives: 0,
    total: 0
  };

  const totalSavings = feeReductions.total + grants.total + strategicFiling.total + taxBenefits.total;

  return {
    feeReductions,
    grants,
    strategicFiling,
    taxBenefits,
    totalSavings,
    confidenceLevel: 'likely' // Will be calculated in main function
  };
}

function calculateFeeReductions(input: PatentCalculationInput, results: PatentCostResult) {
  let microEntity = 0;
  let smallEntity = 0;
  let onlineFiling = 0;

  // Calculate fee reductions for each jurisdiction
  Object.entries(results.jurisdictionCosts).forEach(([jurisdiction, costs]) => {
    const officialFees = costs.breakdown.officialFees;
    
    if (jurisdiction === 'USPTO') {
      // Apply either micro entity OR small entity (not both)
      // Assume micro entity status (most favorable)
      microEntity += officialFees * FEE_REDUCTIONS.USPTO.microEntity;
      // Online filing discount applies on top of entity discount
      onlineFiling += officialFees * FEE_REDUCTIONS.USPTO.onlineFiling;
    } else if (jurisdiction === 'EPO') {
      // SME discount
      smallEntity += officialFees * FEE_REDUCTIONS.EPO.sme;
      // Online filing discount applies on top of SME discount
      onlineFiling += officialFees * FEE_REDUCTIONS.EPO.onlineFiling;
    } else if (jurisdiction === 'IPOS') {
      onlineFiling += officialFees * FEE_REDUCTIONS.IPOS.onlineFiling;
    }
  });

  // Cap fee reductions to 70% of official fees to prevent over-savings
  const totalFeeReductions = microEntity + smallEntity + onlineFiling;
  const totalOfficialFees = Object.values(results.jurisdictionCosts)
    .reduce((sum, costs) => sum + costs.breakdown.officialFees, 0);
  const maxFeeReductions = totalOfficialFees * 0.7;
  
  const cappedTotal = Math.min(totalFeeReductions, maxFeeReductions);
  const reductionRatio = cappedTotal / totalFeeReductions;

  return {
    microEntity: microEntity * reductionRatio,
    smallEntity: smallEntity * reductionRatio,
    onlineFiling: onlineFiling * reductionRatio,
    total: cappedTotal
  };
}

function calculateGrants(input: PatentCalculationInput, results: PatentCostResult) {
  let usGrants = 0;
  let euGrants = 0;
  let singaporeGrants = 0;

  // Calculate grants based on selected jurisdictions
  if (results.jurisdictionCosts['USPTO']) {
    usGrants = GRANTS.USPTO.average * 0.3; // 30% chance of grant approval
  }
  
  if (results.jurisdictionCosts['EPO']) {
    euGrants = GRANTS.EPO.average * 0.25; // 25% chance of grant approval
  }
  
  if (results.jurisdictionCosts['IPOS']) {
    singaporeGrants = GRANTS.IPOS.average * 0.4; // 40% chance for local entities
  }

  return {
    usGrants,
    euGrants,
    singaporeGrants,
    total: usGrants + euGrants + singaporeGrants
  };
}

function calculateStrategicFilingSavings(input: PatentCalculationInput, results: PatentCostResult) {
  let pctRoute = 0;
  let provisionalFiling = 0;
  let staggeredFiling = 0;

  const jurisdictions = Object.keys(results.jurisdictionCosts);
  
  // PCT route savings (if multiple jurisdictions)
  if (jurisdictions.length > 1) {
    pctRoute = results.totalCost * STRATEGIC_SAVINGS.pctRoute.basePercentage;
    pctRoute += jurisdictions.length * STRATEGIC_SAVINGS.pctRoute.searchReuse;
  }

  // Provisional filing savings
  const complexityMultiplier = {
    'Simple': 1.0,
    'Complex': 1.5,
    'Cutting-Edge': 2.0,
    'Software/Biotech': 1.8
  }[input.solutionComplexity] || 1.0;
  
  provisionalFiling = STRATEGIC_SAVINGS.provisionalFiling.simple * complexityMultiplier;

  // Staggered filing savings
  if (jurisdictions.length > 1) {
    staggeredFiling = (jurisdictions.length - 1) * STRATEGIC_SAVINGS.staggeredFiling.perJurisdiction;
  }

  return {
    pctRoute,
    provisionalFiling,
    staggeredFiling,
    total: pctRoute + provisionalFiling + staggeredFiling
  };
}

function calculateTaxBenefits(input: PatentCalculationInput, results: PatentCostResult) {
  let rndCredits = 0;
  let patentBox = 0;
  let innovationIncentives = 0;

  // Calculate tax benefits for each jurisdiction
  Object.entries(results.jurisdictionCosts).forEach(([jurisdiction, costs]) => {
    const jurisdictionCosts = costs.totalLifecycleCost;
    
    if (jurisdiction === 'USPTO') {
      // Tax benefits are typically 20-35% of qualifying costs, not total costs
      const qualifyingCosts = jurisdictionCosts * 0.6; // Assume 60% of costs qualify
      rndCredits += qualifyingCosts * TAX_BENEFITS.USPTO.rndCredit;
      innovationIncentives += qualifyingCosts * TAX_BENEFITS.USPTO.stateCredit;
    } else if (jurisdiction === 'EPO') {
      const qualifyingCosts = jurisdictionCosts * 0.5; // Assume 50% of costs qualify
      patentBox += qualifyingCosts * TAX_BENEFITS.EPO.patentBox;
      innovationIncentives += qualifyingCosts * TAX_BENEFITS.EPO.innovationIncentives;
    } else if (jurisdiction === 'IPOS') {
      const qualifyingCosts = jurisdictionCosts * 0.7; // Assume 70% of costs qualify
      rndCredits += qualifyingCosts * TAX_BENEFITS.IPOS.rndDeduction;
      innovationIncentives += qualifyingCosts * TAX_BENEFITS.IPOS.ipDevelopment;
    }
  });

  // Cap tax benefits to 40% of total costs (realistic maximum)
  const totalTaxBenefits = rndCredits + patentBox + innovationIncentives;
  const totalCosts = results.totalCost;
  const maxTaxBenefits = totalCosts * 0.4;
  
  const cappedTotal = Math.min(totalTaxBenefits, maxTaxBenefits);
  const benefitRatio = cappedTotal / totalTaxBenefits;

  return {
    rndCredits: rndCredits * benefitRatio,
    patentBox: patentBox * benefitRatio,
    innovationIncentives: innovationIncentives * benefitRatio,
    total: cappedTotal
  };
}

function getJurisdictionSpecificSavings(input: PatentCalculationInput, results: PatentCostResult): Record<string, string[]> {
  const jurisdictionSpecific: Record<string, string[]> = {};

  Object.keys(results.jurisdictionCosts).forEach(jurisdiction => {
    const strategies: string[] = [];
    
    if (jurisdiction === 'USPTO') {
      strategies.push('Apply for micro-entity status (75% fee reduction)');
      strategies.push('File online for 10% discount');
      strategies.push('Consider SBIR/STTR grants ($50K-$75K available)');
    } else if (jurisdiction === 'EPO') {
      strategies.push('Qualify for SME status (30% fee reduction)');
      strategies.push('File online for 20% discount');
      strategies.push('Selective country validation saves ~$2K per country');
    } else if (jurisdiction === 'IPOS') {
      strategies.push('Apply for IPO grants (up to $15K for local entities)');
      strategies.push('File online for 15% discount');
    }
    
    jurisdictionSpecific[jurisdiction] = strategies;
  });

  return jurisdictionSpecific;
}

export function formatSavingsForDisplay(savings: SavingsDisplay): {
  totalFormatted: string;
  breakdownFormatted: Record<string, string>;
  confidenceLevel: string;
} {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return {
    totalFormatted: formatCurrency(savings.totalSavings),
    breakdownFormatted: {
      feeReductions: formatCurrency(savings.breakdown.feeReductions.total),
      grants: formatCurrency(savings.breakdown.grants.total),
      strategicFiling: formatCurrency(savings.breakdown.strategicFiling.total),
      taxBenefits: formatCurrency(savings.breakdown.taxBenefits.total),
      guaranteed: formatCurrency(savings.guaranteedSavings),
      potential: formatCurrency(savings.potentialSavings)
    },
    confidenceLevel: savings.confidenceLevel
  };
} 