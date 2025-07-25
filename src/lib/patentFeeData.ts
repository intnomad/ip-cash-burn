// Patent fee data based on accurate market rates for US, EU, and Singapore
// All amounts in USD for consistency

export interface PatentFeeStructure {
  jurisdiction: string;
  patentType: string;
  complexity: string;
  legalAgentFeeUSD: number;
  filingFeeUSD: number;
  drawingFeeUSD: number;
  searchFeeUSD: number;
  officeActionUSD: number;
  translationUSD: number;
  maintenance20YrUSD: number;
}

export const PATENT_FEE_DATA: PatentFeeStructure[] = [
  // US Utility Patents
  {
    jurisdiction: "US",
    patentType: "Utility",
    complexity: "Simple",
    legalAgentFeeUSD: 8000,
    filingFeeUSD: 400,
    drawingFeeUSD: 300,
    searchFeeUSD: 1000,
    officeActionUSD: 2500,
    translationUSD: 0,
    maintenance20YrUSD: 7500
  },
  {
    jurisdiction: "US",
    patentType: "Utility",
    complexity: "Moderate",
    legalAgentFeeUSD: 12000,
    filingFeeUSD: 900,
    drawingFeeUSD: 600,
    searchFeeUSD: 1500,
    officeActionUSD: 3500,
    translationUSD: 0,
    maintenance20YrUSD: 7500
  },
  {
    jurisdiction: "US",
    patentType: "Utility",
    complexity: "Complex",
    legalAgentFeeUSD: 20000,
    filingFeeUSD: 1500,
    drawingFeeUSD: 1000,
    searchFeeUSD: 2500,
    officeActionUSD: 4000,
    translationUSD: 0,
    maintenance20YrUSD: 7500
  },
  {
    jurisdiction: "US",
    patentType: "Utility",
    complexity: "Software/Biotech",
    legalAgentFeeUSD: 22000,
    filingFeeUSD: 1800,
    drawingFeeUSD: 1200,
    searchFeeUSD: 3000,
    officeActionUSD: 5000,
    translationUSD: 0,
    maintenance20YrUSD: 7500
  },
  // US Design Patents
  {
    jurisdiction: "US",
    patentType: "Design",
    complexity: "Simple",
    legalAgentFeeUSD: 3500,
    filingFeeUSD: 250,
    drawingFeeUSD: 300,
    searchFeeUSD: 800,
    officeActionUSD: 2000,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  {
    jurisdiction: "US",
    patentType: "Design",
    complexity: "Moderate",
    legalAgentFeeUSD: 4500,
    filingFeeUSD: 400,
    drawingFeeUSD: 500,
    searchFeeUSD: 1200,
    officeActionUSD: 2500,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  {
    jurisdiction: "US",
    patentType: "Design",
    complexity: "Complex",
    legalAgentFeeUSD: 6000,
    filingFeeUSD: 700,
    drawingFeeUSD: 800,
    searchFeeUSD: 1600,
    officeActionUSD: 3000,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  // US Plant Patents
  {
    jurisdiction: "US",
    patentType: "Plant",
    complexity: "Simple",
    legalAgentFeeUSD: 4000,
    filingFeeUSD: 360,
    drawingFeeUSD: 300,
    searchFeeUSD: 1000,
    officeActionUSD: 2000,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  {
    jurisdiction: "US",
    patentType: "Plant",
    complexity: "Complex",
    legalAgentFeeUSD: 6000,
    filingFeeUSD: 720,
    drawingFeeUSD: 500,
    searchFeeUSD: 1600,
    officeActionUSD: 3000,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  // EU (EPO) Utility Patents
  {
    jurisdiction: "EU (EPO)",
    patentType: "Utility",
    complexity: "Simple",
    legalAgentFeeUSD: 10000,
    filingFeeUSD: 1500,
    drawingFeeUSD: 400,
    searchFeeUSD: 1500,
    officeActionUSD: 3000,
    translationUSD: 2000,
    maintenance20YrUSD: 25000
  },
  {
    jurisdiction: "EU (EPO)",
    patentType: "Utility",
    complexity: "Moderate",
    legalAgentFeeUSD: 15000,
    filingFeeUSD: 2500,
    drawingFeeUSD: 800,
    searchFeeUSD: 2500,
    officeActionUSD: 4000,
    translationUSD: 3500,
    maintenance20YrUSD: 25000
  },
  {
    jurisdiction: "EU (EPO)",
    patentType: "Utility",
    complexity: "Complex",
    legalAgentFeeUSD: 22000,
    filingFeeUSD: 3500,
    drawingFeeUSD: 1200,
    searchFeeUSD: 4000,
    officeActionUSD: 5000,
    translationUSD: 5000,
    maintenance20YrUSD: 25000
  },
  {
    jurisdiction: "EU (EPO)",
    patentType: "Utility",
    complexity: "Software/Biotech",
    legalAgentFeeUSD: 25000,
    filingFeeUSD: 4500,
    drawingFeeUSD: 2000,
    searchFeeUSD: 5000,
    officeActionUSD: 6000,
    translationUSD: 6000,
    maintenance20YrUSD: 25000
  },
  // EU (EPO) Design Patents
  {
    jurisdiction: "EU (EPO)",
    patentType: "Design",
    complexity: "Simple",
    legalAgentFeeUSD: 5000,
    filingFeeUSD: 900,
    drawingFeeUSD: 400,
    searchFeeUSD: 1200,
    officeActionUSD: 2000,
    translationUSD: 1500,
    maintenance20YrUSD: 8000
  },
  {
    jurisdiction: "EU (EPO)",
    patentType: "Design",
    complexity: "Moderate",
    legalAgentFeeUSD: 8000,
    filingFeeUSD: 1200,
    drawingFeeUSD: 700,
    searchFeeUSD: 1800,
    officeActionUSD: 2500,
    translationUSD: 2000,
    maintenance20YrUSD: 8000
  },
  {
    jurisdiction: "EU (EPO)",
    patentType: "Design",
    complexity: "Complex",
    legalAgentFeeUSD: 12000,
    filingFeeUSD: 1800,
    drawingFeeUSD: 1200,
    searchFeeUSD: 2400,
    officeActionUSD: 3500,
    translationUSD: 3000,
    maintenance20YrUSD: 8000
  },
  // EU (EPO) Plant Patents
  {
    jurisdiction: "EU (EPO)",
    patentType: "Plant",
    complexity: "Simple",
    legalAgentFeeUSD: 8000,
    filingFeeUSD: 1600,
    drawingFeeUSD: 500,
    searchFeeUSD: 1500,
    officeActionUSD: 2000,
    translationUSD: 2500,
    maintenance20YrUSD: 8000
  },
  {
    jurisdiction: "EU (EPO)",
    patentType: "Plant",
    complexity: "Complex",
    legalAgentFeeUSD: 12000,
    filingFeeUSD: 3000,
    drawingFeeUSD: 900,
    searchFeeUSD: 2200,
    officeActionUSD: 3000,
    translationUSD: 4000,
    maintenance20YrUSD: 8000
  },
  // Singapore Utility Patents
  {
    jurisdiction: "Singapore",
    patentType: "Utility",
    complexity: "Simple",
    legalAgentFeeUSD: 4000,
    filingFeeUSD: 120,
    drawingFeeUSD: 200,
    searchFeeUSD: 800,
    officeActionUSD: 2000,
    translationUSD: 0,
    maintenance20YrUSD: 5000
  },
  {
    jurisdiction: "Singapore",
    patentType: "Utility",
    complexity: "Moderate",
    legalAgentFeeUSD: 7000,
    filingFeeUSD: 200,
    drawingFeeUSD: 400,
    searchFeeUSD: 1200,
    officeActionUSD: 3000,
    translationUSD: 0,
    maintenance20YrUSD: 5000
  },
  {
    jurisdiction: "Singapore",
    patentType: "Utility",
    complexity: "Complex",
    legalAgentFeeUSD: 12000,
    filingFeeUSD: 400,
    drawingFeeUSD: 800,
    searchFeeUSD: 2000,
    officeActionUSD: 3500,
    translationUSD: 0,
    maintenance20YrUSD: 5000
  },
  {
    jurisdiction: "Singapore",
    patentType: "Utility",
    complexity: "Software/Biotech",
    legalAgentFeeUSD: 14000,
    filingFeeUSD: 600,
    drawingFeeUSD: 1200,
    searchFeeUSD: 3000,
    officeActionUSD: 4000,
    translationUSD: 0,
    maintenance20YrUSD: 5000
  },
  // Singapore Design Patents
  {
    jurisdiction: "Singapore",
    patentType: "Design",
    complexity: "Simple",
    legalAgentFeeUSD: 2500,
    filingFeeUSD: 70,
    drawingFeeUSD: 200,
    searchFeeUSD: 800,
    officeActionUSD: 1200,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  {
    jurisdiction: "Singapore",
    patentType: "Design",
    complexity: "Moderate",
    legalAgentFeeUSD: 3500,
    filingFeeUSD: 120,
    drawingFeeUSD: 400,
    searchFeeUSD: 1200,
    officeActionUSD: 1800,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  {
    jurisdiction: "Singapore",
    patentType: "Design",
    complexity: "Complex",
    legalAgentFeeUSD: 5000,
    filingFeeUSD: 200,
    drawingFeeUSD: 700,
    searchFeeUSD: 1800,
    officeActionUSD: 2500,
    translationUSD: 0,
    maintenance20YrUSD: 2000
  },
  // Singapore Plant Patents
  {
    jurisdiction: "Singapore",
    patentType: "Plant",
    complexity: "Simple",
    legalAgentFeeUSD: 3000,
    filingFeeUSD: 100,
    drawingFeeUSD: 200,
    searchFeeUSD: 800,
    officeActionUSD: 1200,
    translationUSD: 1500,
    maintenance20YrUSD: 2000
  },
  {
    jurisdiction: "Singapore",
    patentType: "Plant",
    complexity: "Complex",
    legalAgentFeeUSD: 5000,
    filingFeeUSD: 240,
    drawingFeeUSD: 400,
    searchFeeUSD: 1600,
    officeActionUSD: 2000,
    translationUSD: 3000,
    maintenance20YrUSD: 2000
  }
];

// Helper function to map jurisdictions
export function mapJurisdictionToFeeData(jurisdiction: string): string {
  switch (jurisdiction) {
    case 'USPTO':
      return 'US';
    case 'EPO':
      return 'EU (EPO)';
    case 'IPOS':
      return 'Singapore';
    default:
      return jurisdiction;
  }
}

// Helper function to map patent types
export function mapPatentTypeToFeeData(ipType: string): string {
  switch (ipType) {
    case 'patent':
      return 'Utility';
    case 'design':
      return 'Design';
    default:
      return 'Utility';
  }
}

// Helper function to suggest complexity based on industry
export function suggestComplexityFromIndustry(industrySector: string): string {
  const sector = industrySector?.toLowerCase() || '';
  
  if (sector.includes('software') || sector.includes('biotechnology') || sector.includes('pharmaceuticals')) {
    return 'Software/Biotech';
  } else if (sector.includes('aerospace') || sector.includes('medical devices') || sector.includes('telecommunications')) {
    return 'Complex';
  } else if (sector.includes('manufacturing') || sector.includes('automotive') || sector.includes('energy')) {
    return 'Moderate';
  } else {
    return 'Simple';
  }
}

// Main lookup function
export function getPatentFees(
  jurisdiction: string,
  patentType: string,
  complexity: string
): PatentFeeStructure | null {
  const mappedJurisdiction = mapJurisdictionToFeeData(jurisdiction);
  const mappedPatentType = mapPatentTypeToFeeData(patentType);
  
  return PATENT_FEE_DATA.find(
    fee => 
      fee.jurisdiction === mappedJurisdiction &&
      fee.patentType === mappedPatentType &&
      fee.complexity === complexity
  ) || null;
} 