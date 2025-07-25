import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize OpenAI conditionally
const getOpenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
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

interface CalculationRequest {
  ipType: string
  selectedOffices: string[]
  lifecycleYears: number
  businessSector: string
  description: string
}

interface CostEstimate {
  office: string
  filingCost: number
  maintenanceCost: number
  totalCost: number
  currency: string
}

interface AIInsight {
  type: string
  message: string
  confidence: number
}

// Map IP types to fee categories
const IP_TYPE_MAPPING = {
  patent: ['Filing Fees', 'Patent application filing fees', 'Filing fee'],
  trademark: ['Trademark', 'Trade Mark', 'TM'],
  design: ['Design', 'Industrial Design']
}

// Get patent fees from Supabase
async function getPatentFeesFromDB(office: string, ipType: string) {
  try {
    let tableName = ''
    let queryFields = {}
    
    switch (office) {
      case 'USPTO':
        tableName = 'uspto_patent_fees'
        queryFields = {
          section: ipType === 'patent' ? 'Patent application filing fees' : 'Filing Fees'
        }
        break
      case 'EPO':
        tableName = 'epo_patent_fees'
        queryFields = {
          category: 'Filing Fees'
        }
        break
      case 'IPOS':
        tableName = 'ipos_patent_fees'
        queryFields = {
          category: 'Filing Fees'
        }
        break
      default:
        return null
    }

    let query = supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(5)

    // Use different column names based on office
    if (office === 'USPTO') {
      query = query.ilike('section', '%filing%')
    } else {
      query = query.ilike('category', '%Filing%')
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error querying ${tableName}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching patent fees:', error)
    return null
  }
}

// Extract fee amounts from different database structures
function extractFeeAmount(record: any, office: string): number {
  switch (office) {
    case 'USPTO':
      // Use standard_fee from database
      return parseFloat(record['standard_fee'] || '0')
    case 'EPO':
      // Use amount_eur from database
      return parseFloat(record['amount_eur'] || '0')
    case 'IPOS':
      // Use amount_sgd from database
      return parseFloat(record['amount_sgd'] || '0')
    default:
      return 0
  }
}

// Calculate costs using real data or fallback to mock
async function calculateCosts(request: CalculationRequest): Promise<CostEstimate[]> {
  const estimates: CostEstimate[] = []
  
  // Fallback mock data in case database query fails
  const mockFees = {
    USPTO: {
      patent: { filing: 1600, annualMaintenance: 800 },
      trademark: { filing: 350, annualMaintenance: 300 },
      design: { filing: 760, annualMaintenance: 0 }
    },
    EPO: {
      patent: { filing: 4000, annualMaintenance: 1200 },
      trademark: { filing: 850, annualMaintenance: 400 },
      design: { filing: 350, annualMaintenance: 0 }
    },
    IPOS: {
      patent: { filing: 600, annualMaintenance: 300 },
      trademark: { filing: 200, annualMaintenance: 150 },
      design: { filing: 240, annualMaintenance: 0 }
    }
  }

  const currencies = { USPTO: 'USD', EPO: 'EUR', IPOS: 'SGD' }

  for (const office of request.selectedOffices) {
    try {
      // Try to get real data from Supabase
      const realData = await getPatentFeesFromDB(office, request.ipType)
      
      let filingCost = 0
      let maintenanceCost = 0

      if (realData && realData.length > 0) {
        // Use real data - get the first filing fee record
        const filingRecord = realData.find(record => 
          record.description?.toLowerCase().includes('filing') ||
          record.Description?.toLowerCase().includes('filing')
        ) || realData[0]
        
        filingCost = extractFeeAmount(filingRecord, office)
        
        // Estimate maintenance cost based on filing cost
        // This is a simplified calculation - you may want to add specific maintenance fee queries
        maintenanceCost = filingCost * 0.5 * request.lifecycleYears
        
        // Real data used for calculation
      } else {
        // Fallback to mock data
        const fees = mockFees[office as keyof typeof mockFees]
        const ipTypeFees = fees[request.ipType as keyof typeof fees]
        filingCost = ipTypeFees.filing
        maintenanceCost = ipTypeFees.annualMaintenance * request.lifecycleYears
        
        // Fallback to mock data
      }

      const totalCost = filingCost + maintenanceCost

      estimates.push({
        office,
        filingCost,
        maintenanceCost,
        totalCost,
        currency: currencies[office as keyof typeof currencies]
      })

    } catch (error) {
      console.error(`Error calculating costs for ${office}:`, error)
      
      // Fallback to mock data on error
      const fees = mockFees[office as keyof typeof mockFees]
      const ipTypeFees = fees[request.ipType as keyof typeof fees]
      const filingCost = ipTypeFees.filing
      const maintenanceCost = ipTypeFees.annualMaintenance * request.lifecycleYears
      const totalCost = filingCost + maintenanceCost

      estimates.push({
        office,
        filingCost,
        maintenanceCost,
        totalCost,
        currency: currencies[office as keyof typeof currencies]
      })
    }
  }

  return estimates
}

async function generateInsights(request: CalculationRequest, estimates: CostEstimate[]): Promise<AIInsight[]> {
  try {
    const totalCost = estimates.reduce((sum, est) => sum + est.totalCost, 0)
    const averageCostPerOffice = totalCost / estimates.length

    const prompt = `
    Generate 2-3 brief, actionable insights for an IP cost estimation:
    
    IP Type: ${request.ipType}
    Offices: ${request.selectedOffices.join(', ')}
    Business Sector: ${request.businessSector}
    Lifecycle: ${request.lifecycleYears} years
    Total Estimated Cost: $${totalCost.toLocaleString()}
    
    Cost breakdown:
    ${estimates.map(e => `${e.office}: ${e.currency} ${e.totalCost.toLocaleString()}`).join('\n')}
    
    Provide practical insights about:
    1. Cost comparison vs industry average
    2. Recommendations for filing strategy
    3. Budget optimization tips
    
    Keep each insight under 100 words and actionable for startup founders.
    `

    const openai = getOpenAI();
    let content = '';
    
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        });
        
        content = completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.warn('Gemini API error, using fallback insights:', error);
        content = 'Consider starting with a provisional patent to secure priority at lower cost. Focus on key markets first, then expand internationally as revenue grows. Look into small entity discounts if you qualify.';
      }
    } else {
      // Fallback insights when Gemini is not configured
      content = 'Consider starting with a provisional patent to secure priority at lower cost. Focus on key markets first, then expand internationally as revenue grows. Look into small entity discounts if you qualify.';
    }
    
    // Parse insights from AI response
    const insights: AIInsight[] = [
      {
        type: 'cost_comparison',
        message: `Your total estimated cost of $${totalCost.toLocaleString()} across ${estimates.length} jurisdiction(s) is based on current 2025 filing fees.`,
        confidence: 0.85
      },
      {
        type: 'recommendation',
        message: content.split('\n').filter(line => line.trim())[0] || 'Consider filing in your primary market first to establish priority date.',
        confidence: 0.80
      }
    ]

    // Add AI-generated insight if available
    if (content) {
      insights.push({
        type: 'ai_insight',
        message: content.split('\n').filter(line => line.trim()).slice(1, 2)[0] || 'Monitor renewal deadlines carefully to maintain protection.',
        confidence: 0.75
      })
    }

    return insights
  } catch (error) {
    console.error('Error generating AI insights:', error)
    
    // Fallback insights
    return [
      {
        type: 'cost_comparison',
        message: `Your estimated costs span ${request.selectedOffices.length} jurisdiction(s) using real 2025 fee data where available.`,
        confidence: 0.70
      },
      {
        type: 'recommendation',
        message: 'File in your primary market first to establish priority, then expand based on business growth.',
        confidence: 0.75
      }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculationRequest = await request.json()
    
    // Validate input
    if (!body.selectedOffices || body.selectedOffices.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one IP office' },
        { status: 400 }
      )
    }

    // Calculate costs using real data
    const estimates = await calculateCosts(body)
    
    // Generate AI insights
    const insights = await generateInsights(body, estimates)

    // TODO: Store calculation in Supabase for analytics
    // await supabaseAdmin.from('cost_calculations').insert({...})

    return NextResponse.json({
      estimates,
      insights,
      calculatedAt: new Date().toISOString(),
      dataSource: 'real_and_fallback'
    })

  } catch (error) {
    console.error('Error in calculate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 