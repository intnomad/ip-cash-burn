// lib/freeCostPreview.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { getPatentFees, suggestComplexityFromIndustry } from './patentFeeData';
import { AIInsightsEngine } from './aiInsights';

interface UserInput {
  ipType: 'patent' | 'trademark' | 'design';
  jurisdictions: string[];
  industry: string;
  description: string;
  companyStage: string;
  email: string;
  companyName: string;
  // Patent complexity
  patentComplexity?: string;
  // Fee inclusion toggles
  includeLegalAgentFees?: boolean;
  includeSearchFees?: boolean;
  includeTranslationFees?: boolean;
}

interface FreeCostPreview {
  totalCost: number;
  yearlyBreakdown: { year: number; cost: number }[];
  jurisdictionYearlyBreakdown: Record<string, { year: number; cost: number }[]>;
  jurisdictionCosts: { jurisdiction: string; cost: number }[];
  cashFlowAlerts: string[];
  oneGenericInsight: string;
  upgradeTeaser: string;
  aiInsights: string[];
  actionablePlan: string[];
  timeline: {
    filingToGrant: {
      min: number;
      max: number;
      average: number;
    };
    prosecutionDelays: number;
    industryFactor: number;
  };
}

// Initialize Gemini with OpenAI-compatible interface
const getOpenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Return OpenAI-compatible interface
  return {
    chat: {
      completions: {
        create: async (params: any) => {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = params.messages[0]?.content || '';
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          
          return {
            choices: [{
              message: {
                content: response.text()
              }
            }]
          };
        }
      }
    }
  };
};

export async function generateFreeCostPreview(input: UserInput): Promise<FreeCostPreview> {
  try {
    // 1. Get real fee data from Supabase
    let fees: any[] = [];
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('patent_fees')
        .select('*')
        .in('jurisdiction', input.jurisdictions)
        .eq('ip_type', input.ipType);
      
      fees = data || [];
    }

    // 2. Calculate costs using real data or informed fallbacks
    const calculations = calculateBasicCosts(
      fees, 
      input.jurisdictions,
      input.includeLegalAgentFees ?? true,
      input.includeSearchFees ?? true,
      input.includeTranslationFees ?? true,
      input.ipType,
      input.patentComplexity || 'Simple'
    );
    
    // 3. Generate one valuable insight using AI
    const genericInsight = await generateGenericInsight(input);
    
    // 4. Generate 3 AI-driven insights on IP risks & opportunities
    const insightsEngine = new AIInsightsEngine();
    const aiInsights = await insightsEngine.generateInsights(
      { 
        totalCost: calculations.totalCost, 
        jurisdictionTotals: Object.fromEntries(calculations.jurisdictionCosts.map(j => [j.jurisdiction, j.cost])),
        currencyByJurisdiction: {},
        calculationDate: new Date().toISOString()
      },
      input.description,
      { industry: input.industry, businessStage: input.companyStage, companyName: input.companyName }
    );
    
    // 5. Generate actionable plan for team discussion
    const actionablePlan = await generateActionablePlan(input, calculations.totalCost);
    
    // 6. Create compelling upgrade teaser
    const upgradeTeaser = createUpgradeTeaser(input, calculations.totalCost);

    return {
      totalCost: calculations.totalCost,
      yearlyBreakdown: calculations.yearlyBreakdown,
      jurisdictionYearlyBreakdown: calculations.jurisdictionYearlyBreakdown,
      jurisdictionCosts: calculations.jurisdictionCosts,
      cashFlowAlerts: calculations.cashFlowAlerts,
      oneGenericInsight: genericInsight,
      upgradeTeaser,
      aiInsights: aiInsights.slice(0, 3).map(insight => insight.message),
      actionablePlan,
      timeline: {
        filingToGrant: {
          min: 12, // Average 12 months for a simple patent
          max: 24, // Max 24 months for a complex patent
          average: 18
        },
        prosecutionDelays: 0, // No specific delays for now, can be added later
        industryFactor: 1 // Default factor
      }
    };

  } catch (error) {
    console.error('Error generating free cost preview:', error);
    
    // Graceful fallback with realistic estimates
    return generateFallbackPreview(input);
  }

  // 1. Get fee data from Supabase
  const { data: fees } = await supabaseAdmin
    .from('patent_fees')
    .select('*')
    .in('jurisdiction', input.jurisdictions)
    .eq('ip_type', input.ipType);

  // 2. Calculate basic costs (without AI optimization)
  const calculations = calculateBasicCosts(fees || [], input.jurisdictions);
  
  // 3. Generate one generic insight using Gemini AI
  const genericInsight = await generateGenericInsight(input);
  
  // 4. Create upgrade teaser
  const upgradeTeaser = createUpgradeTeaser(input, calculations.totalCost);

  return {
    totalCost: calculations.totalCost,
    yearlyBreakdown: calculations.yearlyBreakdown,
    jurisdictionYearlyBreakdown: calculations.jurisdictionYearlyBreakdown,
    jurisdictionCosts: calculations.jurisdictionCosts,
    cashFlowAlerts: calculations.cashFlowAlerts,
    oneGenericInsight: genericInsight,
    upgradeTeaser,
    aiInsights: [],
    actionablePlan: [],
    timeline: {
      filingToGrant: {
        min: 12, // Average 12 months for a simple patent
        max: 24, // Max 24 months for a complex patent
        average: 18
      },
      prosecutionDelays: 0, // No specific delays for now, can be added later
      industryFactor: 1 // Default factor
    }
  };
}

// Simple timeline calculation for free preview
function calculateSimpleTimeline(jurisdictions: string[], industry: string, complexity: string) {
  // Base timelines (months) - simplified version
  const baseTimelines = {
    'USPTO': 24,
    'EPO': 30,
    'IPOS': 18
  };

  // Industry factors - simplified
  const industryFactors = {
    'Biotechnology & Life Sciences': 1.4,
    'Pharmaceuticals': 1.5,
    'Software/Biotech': 1.6,
    'Other': 1.1
  };

  // Complexity delays
  const complexityDelays = {
    'Simple': 3,
    'Complex': 9,
    'Cutting-Edge': 15,
    'Software/Biotech': 12
  };

  // Calculate average timeline across jurisdictions
  const jurisdictionTimelines = jurisdictions.map(jurisdiction => {
    const baseTimeline = baseTimelines[jurisdiction as keyof typeof baseTimelines] || 24;
    const industryFactor = industryFactors[industry as keyof typeof industryFactors] || 1.1;
    const complexityDelay = complexityDelays[complexity as keyof typeof complexityDelays] || 6;
    
    return Math.round((baseTimeline * industryFactor) + complexityDelay);
  });

  const averageTimeline = Math.round(jurisdictionTimelines.reduce((sum, t) => sum + t, 0) / jurisdictionTimelines.length);
  const minTimeline = Math.max(18, averageTimeline - 6);
  const maxTimeline = averageTimeline + 6;

  return {
    filingToGrant: {
      min: minTimeline,
      max: maxTimeline,
      average: averageTimeline
    },
    prosecutionDelays: complexityDelays[complexity as keyof typeof complexityDelays] || 6,
    industryFactor: industryFactors[industry as keyof typeof industryFactors] || 1.1
  };
}

function calculateBasicCosts(
  fees: any[], 
  jurisdictions: string[], 
  includeLegalAgentFees = true, 
  includeSearchFees = true, 
  includeTranslationFees = true,
  ipType = 'patent',
  complexity = 'Simple'
) {
  let totalCost = 0;
  const yearlyBreakdown: { year: number; cost: number }[] = [];
  const jurisdictionYearlyBreakdown: Record<string, { year: number; cost: number }[]> = {};
  const jurisdictionCosts: { jurisdiction: string; cost: number }[] = [];
  const cashFlowAlerts: string[] = [];

  // Calculate costs for each jurisdiction using new fee structure
  for (const jurisdiction of jurisdictions) {
    let jurisdictionTotal = 0;
    
    // Skip non-patent calculations for now
    if (ipType !== 'patent' && ipType !== 'design') {
      jurisdictionTotal = 5000; // Basic estimate for trademark
    } else {
      // Get fee structure from lookup table
      const feeStructure = getPatentFees(jurisdiction, ipType, complexity);
      
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
        jurisdictionTotal = ipType === 'design' ? 8000 : 15000;
      }
    }

    jurisdictionCosts.push({
      jurisdiction,
      cost: Math.round(jurisdictionTotal)
    });
    totalCost += jurisdictionTotal;
  }

  // Create detailed 20-year breakdown with jurisdiction-specific scheduling
  for (let year = 0; year <= 20; year++) {
    let yearCost = 0;
    
    // Calculate costs for each jurisdiction separately
    for (const jurisdiction of jurisdictions) {
      const feeStructure = getPatentFees(jurisdiction, ipType, complexity);
      let jurisdictionYearCost = 0;
      
      if (year === 0) {
        // Filing costs in year 0
        if (feeStructure) {
          const filingCosts = feeStructure.filingFeeUSD + feeStructure.drawingFeeUSD;
          const searchCosts = includeSearchFees ? feeStructure.searchFeeUSD : 0;
          const professionalFees = includeLegalAgentFees ? feeStructure.legalAgentFeeUSD * 0.6 : 0;
          jurisdictionYearCost = filingCosts + searchCosts + professionalFees;
        } else {
          jurisdictionYearCost = ipType === 'design' ? 3000 : 6000;
        }
      } else {
        // Maintenance and remaining costs
        if (feeStructure) {
          // Office action costs in year 1-2
          if (year <= 2) {
            jurisdictionYearCost += feeStructure.officeActionUSD / 2;
            // Remaining professional fees
            const remainingProfessional = includeLegalAgentFees ? feeStructure.legalAgentFeeUSD * 0.4 : 0;
            if (year === 1) jurisdictionYearCost += remainingProfessional;
            // Translation costs in year 1
            if (year === 1 && includeTranslationFees) jurisdictionYearCost += feeStructure.translationUSD;
          }
          
          // Maintenance fees distributed across remaining years
          if (year >= 3) {
            jurisdictionYearCost += feeStructure.maintenance20YrUSD / 18; // Spread across years 3-20
          }
        }
      }
      
      // Initialize jurisdiction yearly breakdown if not exists
      if (!jurisdictionYearlyBreakdown[jurisdiction]) {
        jurisdictionYearlyBreakdown[jurisdiction] = [];
      }
      
      jurisdictionYearlyBreakdown[jurisdiction].push({ 
        year, 
        cost: Math.round(jurisdictionYearCost) 
      });
      
      yearCost += jurisdictionYearCost;
    }
    
    yearlyBreakdown.push({ year, cost: Math.round(yearCost) });
  }

  // Generate cash flow alerts for large payments across full 20-year timeline
  yearlyBreakdown.forEach((yearData) => {
    if (yearData.cost > 3000 && yearData.year > 0) {
      cashFlowAlerts.push(`Year ${yearData.year}: Large payment due ($${yearData.cost.toLocaleString()})`);
    }
  });

  // Calculate timeline estimate
  const timeline = calculateSimpleTimeline(jurisdictions, 'Other', complexity);

  return {
    totalCost: Math.round(totalCost),
    yearlyBreakdown,
    jurisdictionYearlyBreakdown,
    jurisdictionCosts,
    cashFlowAlerts,
    timeline
  };
}

async function generateGenericInsight(input: UserInput): Promise<string> {
  const prompt = `
  Generate ONE specific, actionable insight for a ${input.companyStage} ${input.industry} company filing a ${input.ipType}.
  
  Focus on:
  - Entity status discounts (micro/small entity)
  - Alternative protection strategies
  - Timing optimization
  
  Keep it under 50 words and make it feel valuable but not comprehensive.
  Format: "💡 Cost-Saving Tip: [insight]"
  `;

  try {
    const openai = getOpenAI();
    if (!openai) {
      console.warn('🔧 AI insights disabled: Add GEMINI_API_KEY to .env.local to enable AI-powered insights');
      return "💡 Cost-Saving Tip: Consider filing a provisional patent first to secure priority at lower cost.";
    }

    console.log('🚀 Calling Gemini API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('📥 Gemini response received:', response);
    const aiInsight = response.choices[0]?.message?.content;
    if (aiInsight) {
      console.log('✅ AI insight generated successfully:', aiInsight);
      return aiInsight;
    }
    
    console.log('⚠️ No content in Gemini response');
    return "💡 Cost-Saving Tip: Consider filing a provisional patent first to secure priority at lower cost.";
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    // Fallback insights
    const fallbacks = [
      "💡 Cost-Saving Tip: Micro-entity status can reduce USPTO fees by 75% if you qualify.",
      "💡 Cost-Saving Tip: Consider trade secret protection for processes that are hard to reverse-engineer.",
      "💡 Cost-Saving Tip: File provisional patents first to delay major costs by 12 months."
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

async function generateActionablePlan(input: UserInput, totalCost: number): Promise<string[]> {
  const prompt = `
  Generate 2-3 highly actionable and specific bullet points for a ${input.companyStage} ${input.industry} company to discuss with their team about their IP strategy.
  
  Business context: ${input.description}
  Total estimated cost: $${totalCost.toLocaleString()}
  Jurisdictions: ${input.jurisdictions.join(', ')}
  
  Focus on:
  - Immediate next steps (next 30 days)
  - Resource allocation decisions
  - Timeline planning
  - Team responsibilities
  
  Format as bullet points starting with "•". Keep each point under 100 words.
  The final bullet point should be: "• Get in touch with our team to make sure your plan is both cost-effective and optimised to protect your IP portfolio"
  `;

  try {
    const openai = getOpenAI();
    if (!openai) {
      console.warn('🔧 AI actionable plan disabled: Add GEMINI_API_KEY to .env.local to enable AI-powered planning');
      return [
        "• Schedule a team meeting within the next 2 weeks to review the cost breakdown and prioritize jurisdictions based on your market entry strategy",
        "• Assign a team member to research entity status eligibility and prepare documentation for fee reductions",
        "• Get in touch with our team to make sure your plan is both cost-effective and optimised to protect your IP portfolio"
      ];
    }

    console.log('🚀 Calling Gemini API for actionable plan...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    console.log('📥 Gemini actionable plan response received:', response);
    const content = response.choices[0]?.message?.content;
    if (content) {
      console.log('✅ Actionable plan generated successfully:', content);
      // Parse the response into bullet points
      const lines = content.split('\n').filter(line => line.trim() && line.includes('•'));
      if (lines.length >= 2) {
        return lines.slice(0, 3); // Return max 3 bullet points
      }
    }
    
    console.log('⚠️ No valid content in Gemini actionable plan response');
    return [
      "• Schedule a team meeting within the next 2 weeks to review the cost breakdown and prioritize jurisdictions based on your market entry strategy",
      "• Assign a team member to research entity status eligibility and prepare documentation for fee reductions",
      "• Get in touch with our team to make sure your plan is both cost-effective and optimised to protect your IP portfolio"
    ];
  } catch (error) {
    console.error('❌ Gemini API error for actionable plan:', error);
    // Fallback actionable plan
    return [
      "• Schedule a team meeting within the next 2 weeks to review the cost breakdown and prioritize jurisdictions based on your market entry strategy",
      "• Assign a team member to research entity status eligibility and prepare documentation for fee reductions",
      "• Get in touch with our team to make sure your plan is both cost-effective and optimised to protect your IP portfolio"
    ];
  }
}

function createUpgradeTeaser(input: UserInput, totalCost: number): string {
  const potentialSavings = Math.round(totalCost * 0.3); // 30% potential savings
  
  return `Our Professional Analysis reveals 3 strategies that could save you S$${potentialSavings.toLocaleString()}+ including:
  
  ✓ Industry-specific grant opportunities
  ✓ Alternative protection strategies  
  ✓ Optimal filing timeline for your cash flow
  ✓ Competitive landscape insights
  
  See the full strategy for S$79 →`;
}

function generateFallbackPreview(input: UserInput): FreeCostPreview {
  // Realistic fallback estimates based on 2025 fee schedules
  const baseFilingCosts = {
    USPTO: 1600,
    EPO: 4000,
    IPOS: 600
  };

  const baseMaintenance = {
    USPTO: [1600, 3600, 7500], // Years 4, 8, 12
    EPO: [500, 800, 1200],
    IPOS: [300, 500, 800]
  };

  let totalCost = 0;
  const jurisdictionYearlyBreakdown: Record<string, { year: number; cost: number }[]> = {};
  const jurisdictionCosts: { jurisdiction: string; cost: number }[] = [];
  const cashFlowAlerts: string[] = [];

  // Calculate realistic estimates for each jurisdiction
  input.jurisdictions.forEach(jurisdiction => {
    const filingCost = baseFilingCosts[jurisdiction as keyof typeof baseFilingCosts] || 2000;
    const maintenanceCosts = baseMaintenance[jurisdiction as keyof typeof baseMaintenance] || [800, 1200, 1800];
    const jurisdictionTotal = filingCost + maintenanceCosts.reduce((sum, cost) => sum + cost, 0);
    
    jurisdictionCosts.push({
      jurisdiction,
      cost: jurisdictionTotal
    });
    totalCost += jurisdictionTotal;
    
    // Initialize jurisdiction yearly breakdown
    jurisdictionYearlyBreakdown[jurisdiction] = [];
    
    // Create jurisdiction-specific yearly breakdown
    for (let year = 0; year <= 12; year++) {
      let yearCost = 0;
      
      if (year === 0) {
        yearCost = filingCost;
      } else if ([4, 8, 12].includes(year)) {
        yearCost = maintenanceCosts[Math.floor(year / 4) - 1] || 0;
      }
      
      jurisdictionYearlyBreakdown[jurisdiction].push({ year, cost: Math.round(yearCost) });
    }
    
    // Add cash flow alerts for large payments
    maintenanceCosts.forEach((cost, index) => {
      if (cost > 3000) {
        cashFlowAlerts.push(`Year ${(index + 1) * 4}: Large payment due in ${jurisdiction} (S$${cost.toLocaleString()})`);
      }
    });
  });

  // Create realistic yearly breakdown
  const yearlyBreakdown: { year: number; cost: number }[] = [];
  for (let year = 0; year <= 12; year++) {
    let yearCost = 0;
    
    if (year === 0) {
      // Filing costs in year 0
      yearCost = jurisdictionCosts.reduce((sum, j) => sum + (baseFilingCosts[j.jurisdiction as keyof typeof baseFilingCosts] || 2000), 0);
    } else if ([4, 8, 12].includes(year)) {
      // Maintenance years
      yearCost = jurisdictionCosts.length * (baseMaintenance.USPTO[Math.floor(year / 4) - 1] || 1600);
    }
    
    yearlyBreakdown.push({ year, cost: Math.round(yearCost) });
  }

  // Calculate timeline estimate
  const timeline = calculateSimpleTimeline(input.jurisdictions, input.industry, input.patentComplexity || 'Simple');

  return {
    totalCost: Math.round(totalCost),
    yearlyBreakdown,
    jurisdictionYearlyBreakdown,
    jurisdictionCosts,
    cashFlowAlerts: cashFlowAlerts.length > 0 ? cashFlowAlerts : [`Budget carefully: Maintenance fees required in years 4, 8, and 12`],
    oneGenericInsight: `💡 Cost-Saving Tip: ${input.companyStage === 'startup' ? 'Consider filing a provisional patent first to reduce immediate costs by 75%' : 'Qualify for small entity status to reduce fees by 50% across most jurisdictions'}.`,
    upgradeTeaser: createUpgradeTeaser(input, totalCost),
    aiInsights: [],
    actionablePlan: [
      "• Schedule a team meeting within the next 2 weeks to review the cost breakdown and prioritize jurisdictions based on your market entry strategy",
      "• Assign a team member to research entity status eligibility and prepare documentation for fee reductions",
      "• Get in touch with our team to make sure your plan is both cost-effective and optimised to protect your IP portfolio"
    ],
    timeline
  };
} 