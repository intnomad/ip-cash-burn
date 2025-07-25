import { PatentCalculationInput, PatentCostResult, TimelineEstimate, DetailedPatentCostBreakdown } from '../types/calculationTypes';

// Base lawyer fees (USD)
const BASE_LAWYER_FEES = {
  'USPTO': 15000,
  'EPO': 12000,
  'IPOS': 8000
};

// Complexity multipliers
const COMPLEXITY_MULTIPLIERS = {
  'Simple': 1.0,
  'Complex': 1.4,
  'Cutting-Edge': 1.8,
  'Software/Biotech': 1.6
};

// Jurisdiction multipliers (removed - using 1.0 for all jurisdictions)
const JURISDICTION_MULTIPLIERS = {
  'USPTO': 1.0,
  'EPO': 1.0,
  'IPOS': 1.0
};

// Prosecution multipliers (weighted average)
const PROSECUTION_MULTIPLIERS = {
  'Simple': (0.7 * 1.0) + (0.25 * 1.3) + (0.05 * 2.0),
  'Complex': (0.5 * 1.0) + (0.4 * 1.3) + (0.1 * 2.0),
  'Cutting-Edge': (0.3 * 1.0) + (0.5 * 1.3) + (0.2 * 2.0),
  'Software/Biotech': (0.4 * 1.0) + (0.45 * 1.3) + (0.15 * 2.0)
};

// Base timelines (months)
const BASE_TIMELINES = {
  'USPTO': 24,
  'EPO': 30,
  'IPOS': 18
};

// Industry factors
const INDUSTRY_FACTORS = {
  'Automotive & Transportation': 1.1,
  'Biotechnology & Life Sciences': 1.4,
  'Chemical & Materials': 1.3,
  'Energy & Cleantech': 1.2,
  'Financial Technology (FinTech)': 1.0,
  'Food & Agriculture': 1.2,
  'Healthcare & Medical Devices': 1.3,
  'Industrial Manufacturing': 1.1,
  'Information Technology & Software': 1.0,
  'Mechanical Engineering': 1.1,
  'Pharmaceuticals': 1.5,
  'Semiconductors & Microelectronics': 1.2,
  'Telecommunications': 1.1,
  'Other': 1.1
};

// Prosecution delays (months)
const PROSECUTION_DELAYS = {
  'Simple': 3,
  'Complex': 9,
  'Cutting-Edge': 15,
  'Software/Biotech': 12
};

// Industry drawing costs
const INDUSTRY_DRAWING_COSTS = {
  'Automotive & Transportation': 2000,
  'Biotechnology & Life Sciences': 3000,
  'Chemical & Materials': 2500,
  'Energy & Cleantech': 2200,
  'Financial Technology (FinTech)': 1500,
  'Food & Agriculture': 1800,
  'Healthcare & Medical Devices': 3500,
  'Industrial Manufacturing': 2000,
  'Information Technology & Software': 1800,
  'Mechanical Engineering': 2200,
  'Pharmaceuticals': 4000,
  'Semiconductors & Microelectronics': 2800,
  'Telecommunications': 2000,
  'Other': 2000
};

// Exchange rates for currency conversion (2025 rates)
const EXCHANGE_RATES = {
  'EUR': 1.07, // 1 EUR = 1.07 USD
  'SGD': 0.74, // 1 SGD = 0.74 USD
  'USD': 1.00  // 1 USD = 1.00 USD
};

// Official fees structure (2025 rates from CSV files) - converted to USD
const OFFICIAL_FEES = {
  'USPTO': {
    filing: 400, // From patent_services_costs.csv - US filing fee (USD)
    search: 1000, // From patent_services_costs.csv - US search fee (USD)
    examination: 2500, // From patent_services_costs.csv - US office action fee (USD)
    grant: 1200, // Issue fee (estimated) (USD)
    extraClaims: 420, // Per claim over 20 (USD)
    baseClaims: 20,
    renewal: [1600, 3600, 7400, 16400, 24600, 32800, 41000, 49200] // Years 4, 8, 12, 16, 20 (USD)
  },
  'EPO': {
    filing: 135 * EXCHANGE_RATES.EUR, // From epo_patent_fees_2025.csv - online filing fee (EUR → USD)
    search: 1520 * EXCHANGE_RATES.EUR, // From epo_patent_fees_2025.csv - European search fee (EUR → USD)
    examination: 1915 * EXCHANGE_RATES.EUR, // From epo_patent_fees_2025.csv - examination fee (EUR → USD)
    grant: 1080 * EXCHANGE_RATES.EUR, // From epo_patent_fees_2025.csv - grant fee (EUR → USD)
    extraClaims: 270 * EXCHANGE_RATES.EUR, // From epo_patent_fees_2025.csv - per claim over 15 (EUR → USD)
    baseClaims: 15,
    renewal: [530, 690, 845, 1000, 1155, 1305, 1440, 1590].map(fee => fee * EXCHANGE_RATES.EUR) // From epo_patent_fees_2025.csv - years 3-10 (EUR → USD)
  },
  'IPOS': {
    filing: 170 * EXCHANGE_RATES.SGD, // From ipos_patent_fees_june2025.csv - PF1 filing fee (SGD → USD)
    search: 1735 * EXCHANGE_RATES.SGD, // From ipos_patent_fees_june2025.csv - PF10 search fee (SGD → USD)
    examination: 1420 * EXCHANGE_RATES.SGD, // From ipos_patent_fees_june2025.csv - PF12 examination fee (SGD → USD)
    grant: 210 * EXCHANGE_RATES.SGD, // From ipos_patent_fees_june2025.csv - PF14 grant fee (SGD → USD)
    extraClaims: 40 * EXCHANGE_RATES.SGD, // From ipos_patent_fees_june2025.csv - per claim over 20 (SGD → USD)
    baseClaims: 20,
    renewal: [165, 165, 165, 430, 430, 430, 600, 600].map(fee => fee * EXCHANGE_RATES.SGD) // From ipos_patent_fees_june2025.csv - years 5-12 (SGD → USD)
  }
};

function calculateTimeline(jurisdiction: string, industry: string, complexity: string): TimelineEstimate {
  const baseTimeline = BASE_TIMELINES[jurisdiction as keyof typeof BASE_TIMELINES] || 24;
  const industryFactor = INDUSTRY_FACTORS[industry as keyof typeof INDUSTRY_FACTORS] || 1.1;
  const prosecutionDelay = PROSECUTION_DELAYS[complexity as keyof typeof PROSECUTION_DELAYS] || 6;
  
  const totalMonths = Math.round((baseTimeline * industryFactor) + prosecutionDelay);
  const minMonths = Math.max(18, totalMonths - 6);
  const maxMonths = totalMonths + 6;
  
  return {
    filingToGrant: {
      min: minMonths,
      max: maxMonths,
      average: totalMonths
    },
    totalTimeline: {
      min: minMonths + 12, // Add 12 months for post-grant
      max: maxMonths + 12,
      average: totalMonths + 12
    },
    prosecutionDelays: prosecutionDelay,
    industryFactor: industryFactor
  };
}

function calculateFilingToGrantFees(jurisdiction: string, estimatedClaims: number): number {
  const fees = OFFICIAL_FEES[jurisdiction as keyof typeof OFFICIAL_FEES];
  if (!fees) return 0;
  
  const extraClaims = Math.max(0, estimatedClaims - fees.baseClaims);
  return fees.filing + fees.search + fees.examination + fees.grant + (extraClaims * fees.extraClaims);
}

function calculateProfessionalFees(jurisdiction: string, complexity: string): number {
  const baseFee = BASE_LAWYER_FEES[jurisdiction as keyof typeof BASE_LAWYER_FEES] || 10000;
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity as keyof typeof COMPLEXITY_MULTIPLIERS] || 1.0;
  const jurisdictionMultiplier = JURISDICTION_MULTIPLIERS[jurisdiction as keyof typeof JURISDICTION_MULTIPLIERS] || 1.0;
  const prosecutionMultiplier = PROSECUTION_MULTIPLIERS[complexity as keyof typeof PROSECUTION_MULTIPLIERS] || 1.0;
  
  return baseFee * complexityMultiplier * jurisdictionMultiplier * prosecutionMultiplier;
}

function calculateAdditionalCosts(jurisdiction: string, industry: string, complexity: string, numberOfCountries: number = 1): { drawings: number; translations: number; filing: number; miscellaneous: number } {
  const drawingCosts = INDUSTRY_DRAWING_COSTS[industry as keyof typeof INDUSTRY_DRAWING_COSTS] || 2000;
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity as keyof typeof COMPLEXITY_MULTIPLIERS] || 1.0;
  
  return {
    drawings: drawingCosts * complexityMultiplier,
    translations: jurisdiction === 'EPO' ? 3000 * numberOfCountries : 0,
    filing: 500, // Administrative costs
    miscellaneous: 1000 // Contingency
  };
}

function calculateRenewalFees(jurisdiction: string, protectionDuration: number): number {
  const fees = OFFICIAL_FEES[jurisdiction as keyof typeof OFFICIAL_FEES];
  if (!fees) return 0;
  
  let totalRenewal = 0;
  const renewalYears = [4, 8, 12];
  
  for (let year = 4; year <= protectionDuration; year++) {
    if (renewalYears.includes(year)) {
      const index = renewalYears.indexOf(year);
      totalRenewal += fees.renewal[index] || 0;
    }
  }
  
  return totalRenewal;
}

function suggestFilingStrategy(jurisdictions: string[]): 'Direct Filing' | 'PCT Route' {
  return jurisdictions.length <= 2 ? 'Direct Filing' : 'PCT Route';
}

export async function calculatePatentCostsAndTimeline(input: PatentCalculationInput): Promise<PatentCostResult> {
  const { jurisdictions, industry, solutionComplexity, protectionDuration, estimatedClaims = 20 } = input;
  
  let totalCost = 0;
  const jurisdictionCosts: Record<string, any> = {};
  const timelineEstimates: TimelineEstimate[] = [];
  
  for (const jurisdiction of jurisdictions) {
    const filingToGrantFees = calculateFilingToGrantFees(jurisdiction, estimatedClaims);
    const professionalFees = calculateProfessionalFees(jurisdiction, solutionComplexity);
    const additionalCostsObj = calculateAdditionalCosts(jurisdiction, industry, solutionComplexity);
    const additionalCostsTotal = additionalCostsObj.drawings + additionalCostsObj.translations + additionalCostsObj.filing + additionalCostsObj.miscellaneous;
    const renewalFees = calculateRenewalFees(jurisdiction, protectionDuration);
    
    const filingToGrantCost = filingToGrantFees + professionalFees + additionalCostsTotal;
    const totalLifecycleCost = filingToGrantCost + renewalFees;
    
    jurisdictionCosts[jurisdiction] = {
      totalLifecycleCost,
      filingToGrantCost,
      renewalCosts: renewalFees,
      breakdown: {
        officialFees: filingToGrantFees,
        professionalFees,
        additionalCosts: additionalCostsTotal,
        drawings: additionalCostsObj.drawings,
        translations: additionalCostsObj.translations
      }
    };
    
    totalCost += totalLifecycleCost;
    timelineEstimates.push(calculateTimeline(jurisdiction, industry, solutionComplexity));
  }
  
  // Calculate average timeline
  const avgMin = Math.round(timelineEstimates.reduce((sum, t) => sum + t.filingToGrant.min, 0) / timelineEstimates.length);
  const avgMax = Math.round(timelineEstimates.reduce((sum, t) => sum + t.filingToGrant.max, 0) / timelineEstimates.length);
  const avgAverage = Math.round(timelineEstimates.reduce((sum, t) => sum + t.filingToGrant.average, 0) / timelineEstimates.length);
  
  const timeline: TimelineEstimate = {
    filingToGrant: {
      min: avgMin,
      max: avgMax,
      average: avgAverage
    },
    totalTimeline: {
      min: avgMin + 12,
      max: avgMax + 12,
      average: avgAverage + 12
    },
    prosecutionDelays: Math.round(timelineEstimates.reduce((sum, t) => sum + t.prosecutionDelays, 0) / timelineEstimates.length),
    industryFactor: Math.round(timelineEstimates.reduce((sum, t) => sum + t.industryFactor, 0) / timelineEstimates.length)
  };
  
  // Filing strategy comparison (if multiple jurisdictions)
  let filingStrategyComparison;
  if (jurisdictions.length > 1) {
    const directFilingCost = totalCost;
    const pctRouteCost = totalCost * 1.3; // 30% higher for PCT
    
    const pctTimeline: TimelineEstimate = {
      filingToGrant: {
        min: timeline.filingToGrant.min + 18,
        max: timeline.filingToGrant.max + 18,
        average: timeline.filingToGrant.average + 18
      },
      totalTimeline: {
        min: timeline.totalTimeline.min + 18,
        max: timeline.totalTimeline.max + 18,
        average: timeline.totalTimeline.average + 18
      },
      prosecutionDelays: timeline.prosecutionDelays,
      industryFactor: timeline.industryFactor
    };
    
    filingStrategyComparison = {
      directFiling: { totalCost: directFilingCost, timeline },
      pctRoute: { totalCost: pctRouteCost, timeline: pctTimeline }
    };
  }
  
  return {
    totalCost,
    jurisdictionCosts,
    timeline,
    filingStrategyComparison,
    calculationDate: new Date().toISOString(),
    currency: 'USD'
  };
}

export async function calculateDetailedPatentCostsAndTimeline(input: PatentCalculationInput): Promise<DetailedPatentCostBreakdown> {
  const basicResult = await calculatePatentCostsAndTimeline(input);
  
  // Generate year-by-year cost breakdown
  const yearByYearCosts = [];
  for (let year = 0; year <= input.protectionDuration; year++) {
    let yearCost = 0;
    
    if (year === 0) {
      // Initial filing costs
      Object.values(basicResult.jurisdictionCosts).forEach((costs: any) => {
        yearCost += costs.filingToGrantCost * 0.7; // 70% upfront
      });
    } else if (year === 1) {
      // Remaining filing costs
      Object.values(basicResult.jurisdictionCosts).forEach((costs: any) => {
        yearCost += costs.filingToGrantCost * 0.3; // 30% remaining
      });
    } else {
      // Renewal fees distributed
      Object.values(basicResult.jurisdictionCosts).forEach((costs: any) => {
        yearCost += costs.renewalCosts / (input.protectionDuration - 1);
      });
    }
    
    yearByYearCosts.push({ year, cost: Math.round(yearCost) });
  }
  
  // Generate potential savings
  const potentialSavings = {
    microEntity: basicResult.totalCost * 0.25, // 25% savings for micro entity
    provisionalFirst: basicResult.totalCost * 0.15, // 15% savings for provisional first
    strategicFiling: basicResult.totalCost * 0.1 // 10% savings for strategic filing
  };
  
  // Generate maintenance strategy
  const generateMaintenanceStrategy = () => {
    const jurisdictions = Object.keys(basicResult.jurisdictionCosts);
    return jurisdictions.map(jurisdiction => ({
      jurisdiction,
      keyDates: [4, 8, 12].map(year => ({
        year,
        fee: basicResult.jurisdictionCosts[jurisdiction].renewalCosts / 3
      }))
    }));
  };
  
  return {
    ...basicResult,
    costBreakdown: {
      'total': {
        officialFees: {
          filing: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.officialFees?.filing || 0), 0),
          search: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.officialFees?.search || 0), 0),
          examination: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.officialFees?.examination || 0), 0),
          grant: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.officialFees?.grant || 0), 0),
          extraClaims: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.officialFees?.extraClaims || 0), 0),
          renewal: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.officialFees?.renewal || 0), 0)
        },
        professionalFees: {
          baseFee: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.professionalFees?.baseFee || 0), 0),
          complexityMultiplier: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.professionalFees?.complexityMultiplier || 0), 0),
          jurisdictionMultiplier: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.professionalFees?.jurisdictionMultiplier || 0), 0),
          prosecutionMultiplier: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.professionalFees?.prosecutionMultiplier || 0), 0),
          total: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.professionalFees?.total || 0), 0)
        },
        additionalCosts: {
          drawings: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.additionalCosts?.drawings || 0), 0),
          translations: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.additionalCosts?.translations || 0), 0),
          filing: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.additionalCosts?.filing || 0), 0),
          miscellaneous: Object.values(basicResult.jurisdictionCosts).reduce((sum: number, costs: any) => sum + (costs.breakdown?.additionalCosts?.miscellaneous || 0), 0)
        }
      }
    },
    yearByYearCosts: { 'total': Object.fromEntries(yearByYearCosts.map(item => [item.year, item.cost])) },
    potentialSavings: {
      'microEntity': [{
        type: 'fee_reduction',
        name: 'Micro Entity Status',
        description: '25% reduction in USPTO fees for qualifying entities',
        potentialSaving: potentialSavings.microEntity,
        requirementDescription: 'Must meet micro entity criteria (income < $150k, fewer than 4 previous applications)',
        applicationUrl: 'https://www.uspto.gov/patents/apply/filing-online/patent-fees'
      }],
      'provisionalFirst': [{
        type: 'strategy',
        name: 'Provisional Patent First',
        description: 'File provisional patent before full application',
        potentialSaving: potentialSavings.provisionalFirst,
        requirementDescription: 'File provisional within 12 months of invention disclosure',
        applicationUrl: undefined
      }],
      'strategicFiling': [{
        type: 'strategy',
        name: 'Strategic Filing Order',
        description: 'Optimize filing sequence for cost efficiency',
        potentialSaving: potentialSavings.strategicFiling,
        requirementDescription: 'File in priority order based on market importance',
        applicationUrl: undefined
      }]
    },
    calculationNotes: [
      `Based on ${input.solutionComplexity} complexity and ${input.protectionDuration}-year protection`,
      `Includes official fees, professional services, and maintenance costs`,
      `Timeline estimates account for ${input.industry} industry factors`
    ]
  };
} 