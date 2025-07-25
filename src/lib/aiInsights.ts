// lib/aiInsights.ts
// AI-powered cost insights using Google Gemini

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DetailedCostBreakdown, BasicCostResult } from '@/types/calculationTypes';

// Initialize Gemini with OpenAI-compatible interface
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
          const prompt = params.messages.map((msg: any) => msg.content).join('\n');
          
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

export interface AIInsight {
  type: 'cost_comparison' | 'risk_assessment' | 'recommendation' | 'optimization';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  confidenceScore: number;
  actionable: boolean;
}

export class AIInsightsEngine {
  
  async generateInsights(
    calculationResult: DetailedCostBreakdown | BasicCostResult,
    businessDescription?: string,
    strategicContext?: {
      industry?: string;
      businessStage?: string;
      companyName?: string;
      pressingQuestion?: string;
    }
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Generate basic rule-based insights
    insights.push(...this.generateBasicInsights(calculationResult));
    
    // Generate AI insights if Gemini is available and business description provided
    if (businessDescription && process.env.GEMINI_API_KEY) {
      try {
        const aiInsights = await this.generateAIInsights(calculationResult, businessDescription, strategicContext);
        insights.push(...aiInsights);
      } catch (error) {
        console.warn('Failed to generate AI insights:', error);
      }
    }
    
    return insights;
  }
  
  private generateBasicInsights(result: DetailedCostBreakdown | BasicCostResult): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Cost comparison insights
    if (result.jurisdictionTotals) {
      const costs = Object.entries(result.jurisdictionTotals);
      if (costs.length > 1) {
        const sortedCosts = costs.sort((a, b) => a[1] - b[1]);
        const cheapest = sortedCosts[0];
        const mostExpensive = sortedCosts[sortedCosts.length - 1];
        
        if (mostExpensive[1] > cheapest[1] * 1.5) {
          insights.push({
            type: 'cost_comparison',
            title: 'Significant Cost Variation',
            message: `Filing costs vary significantly across jurisdictions. ${cheapest[0]} is ${Math.round(((mostExpensive[1] - cheapest[1]) / cheapest[1]) * 100)}% cheaper than ${mostExpensive[0]}.`,
            priority: 'medium',
            confidenceScore: 0.9,
            actionable: true
          });
        }
      }
    }
    
    // High cost warning
    if (result.totalCost > 50000) {
      insights.push({
        type: 'risk_assessment',
        title: 'High Filing Costs',
        message: `Total estimated cost of $${result.totalCost.toLocaleString()} is substantial. Consider prioritizing key markets or phasing your filing strategy.`,
        priority: 'high',
        confidenceScore: 0.8,
        actionable: true
      });
    }
    
    // Entity type optimization
    if ('costBreakdown' in result) {
      insights.push({
        type: 'optimization',
        title: 'Entity Status Benefits',
        message: 'Ensure you qualify for small or micro entity status to reduce USPTO fees by up to 75%.',
        priority: 'medium',
        confidenceScore: 0.7,
        actionable: true
      });
    }
    
    return insights;
  }
  
  private async generateAIInsights(
    result: DetailedCostBreakdown | BasicCostResult,
    businessDescription: string,
    strategicContext?: {
      industry?: string;
      businessStage?: string;
      companyName?: string;
      pressingQuestion?: string;
    }
  ): Promise<AIInsight[]> {
    try {
      const openai = getOpenAI();
      if (!openai) {
        // Return fallback insights if Gemini is not configured
        return [
          {
            type: 'recommendation',
            title: 'Consider Timing Strategy',
            message: 'File a provisional patent first to secure priority at lower cost.',
            priority: 'high',
            confidenceScore: 0.8,
            actionable: true
          },
          {
            type: 'cost_comparison',
            title: 'Jurisdiction Selection',
            message: 'Focus on key markets first, then expand internationally as revenue grows.',
            priority: 'medium',
            confidenceScore: 0.7,
            actionable: true
          }
        ];
      }

      // Build enhanced prompt with strategic context
      let prompt = `Based on this business: "${businessDescription}" with filing costs of $${result.totalCost}, provide 2-3 strategic IP insights.`;
      
      if (strategicContext) {
        prompt += '\n\nAdditional Context:';
        if (strategicContext.industry) prompt += `\n- Industry: ${strategicContext.industry}`;
        if (strategicContext.businessStage) prompt += `\n- Stage: ${strategicContext.businessStage}`;
        if (strategicContext.companyName) prompt += `\n- Company: ${strategicContext.companyName}`;
        if (strategicContext.pressingQuestion) prompt += `\n- Key Question: ${strategicContext.pressingQuestion}`;
      }
      
      prompt += '\n\nProvide actionable recommendations considering the company stage, industry dynamics, and specific concerns. Focus on timing, costs, and strategic value.';
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an IP strategy expert. Provide exactly 3 concise, actionable insights about patent filing strategy based on business context and costs. Format each insight as a separate line starting with a number (1., 2., 3.).'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) return [];
      
      // Parse AI response into insights (simplified)
      const insights: AIInsight[] = [];
      const lines = content.split('\n').filter(line => line.trim());
      
      for (let i = 0; i < Math.min(lines.length, 3); i++) {
        if (lines[i].trim()) {
          insights.push({
            type: 'recommendation',
            title: `AI Recommendation ${i + 1}`,
            message: lines[i].trim(),
            priority: i === 0 ? 'high' : 'medium',
            confidenceScore: 0.75,
            actionable: true
          });
        }
      }
      
      return insights;
    } catch (error) {
      console.warn('Gemini API call failed:', error);
      return [];
    }
  }
}

// Export convenience function
export async function generateInsights(
  result: DetailedCostBreakdown | BasicCostResult,
  businessDescription?: string,
  strategicContext?: {
    industry?: string;
    businessStage?: string;
    companyName?: string;
    pressingQuestion?: string;
  }
): Promise<AIInsight[]> {
  const engine = new AIInsightsEngine();
  return engine.generateInsights(result, businessDescription, strategicContext);
}