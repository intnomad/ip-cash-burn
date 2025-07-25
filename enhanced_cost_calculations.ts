// Enhanced Patent Cost Calculator with Advanced Database Schema
// This version leverages the improved schema for more accurate calculations

import { supabaseAdmin as supabase } from '@/lib/supabase';

export interface EnhancedCostCalculationInput {
  ipType: 'patent' | 'trademark' | 'design';
  offices: string[];
  lifecycleYears: number;
  entityType: 'standard' | 'small' | 'micro';
  businessDescription: string;
  claimCount?: number; // Number of patent claims
  pageCount?: number; // Application page count
  industrySector?: string; // For grant matching
  companySize?: 'startup' | 'sme' | 'large'; // For subsidy eligibility
}

export interface EnhancedOfficeCostBreakdown {
  office: string;
  currency: string;
  costs: {
    filing: number;
    search: number;
    examination: number;
    issue: number; // Grant/registration fee
    maintenance: number;
    claimsExtra: number; // Additional claims fees
    pagesExtra: number; // Additional pages fees
    designations?: number; // EPO designation fees
    total: number;
    discountedTotal: number; // After grants/subsidies
  };
  timeline: Array<{
    year: number;
    description: string;
    amount: number;
    feeType: string;
    isRequired: boolean;
  }>;
  applicableGrants: Array<{
    programName: string;
    subsidyPercentage: number;
    maxAmount: number;
    description: string;
    applicationUrl: string;
  }>;
}

export interface EnhancedCostCalculationResult {
  totalCost: number;
  totalWithGrants: number; // After applying all subsidies
  potentialSavings: number;
  officeCosts: EnhancedOfficeCostBreakdown[];
  insights: string[];
  riskScore: number;
  recommendedGrants: any[];
  exchangeRatesUsed: Record<string, number>;
}

export class EnhancedPatentCostCalculator {
  private feeData: Map<string, any[]> = new Map();
  private exchangeRates: Map<string, number> = new Map();
  private grantPrograms: any[] = [];

  async loadEnhancedFeeData() {
    if (this.feeData.size > 0) return; // Already loaded

    // Load exchange rates first
    await this.loadExchangeRates();
    
    // Load grant programs
    await this.loadGrantPrograms();

    const offices = ['USPTO', 'EPO', 'IPOS'];
    
    for (const office of offices) {
      try {
        let tableName = '';
        switch (office) {
          case 'USPTO':
            tableName = 'uspto_patent_fees_new';
            break;
          case 'EPO':
            tableName = 'epo_patent_fees_new';
            break;
          case 'IPOS':
            tableName = 'ipos_patent_fees_new';
            break;
        }

        const { data: fees, error } = await supabase
          .from(tableName)
          .select('*')
          .lte('effective_date', new Date().toISOString())
          .or('expiration_date.is.null,expiration_date.gte.' + new Date().toISOString())
          .order('effective_date', { ascending: false });

        if (error) {
          console.error(`Error loading ${office} fees:`, error);
          continue;
        }

        if (fees && fees.length > 0) {
          this.feeData.set(office, fees);
          console.log(`${office} enhanced data loaded: ${fees.length} fee types`);
        }
      } catch (error) {
        console.error(`Failed to load ${office} data:`, error);
      }
    }
  }

  private async loadExchangeRates() {
    const { data: rates, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('effective_date', new Date().toISOString().split('T')[0]);

    if (!error && rates) {
      rates.forEach(rate => {
        const key = `${rate.from_currency}_${rate.to_currency}`;
        this.exchangeRates.set(key, rate.rate);
      });
    }
  }

  private async loadGrantPrograms() {
    const { data: grants, error } = await supabase
      .from('grant_programs')
      .select('*')
      .eq('is_active', true)
      .lte('effective_date', new Date().toISOString())
      .or('expiration_date.is.null,expiration_date.gte.' + new Date().toISOString());

    if (!error && grants) {
      this.grantPrograms = grants;
    }
  }

  async calculateEnhancedCosts(input: EnhancedCostCalculationInput): Promise<EnhancedCostCalculationResult> {
    await this.loadEnhancedFeeData();

    const officeCosts: EnhancedOfficeCostBreakdown[] = [];
    let totalCostUSD = 0;
    let totalWithGrantsUSD = 0;

    for (const officeCode of input.offices) {
      const officeCost = await this.calculateEnhancedOfficeCosts(officeCode, input);
      officeCosts.push(officeCost);
      
      // Convert to USD for total calculation
      const usdCost = this.convertToUSD(officeCost.costs.total, officeCost.currency);
      const usdDiscountedCost = this.convertToUSD(officeCost.costs.discountedTotal, officeCost.currency);
      
      totalCostUSD += usdCost;
      totalWithGrantsUSD += usdDiscountedCost;
    }

    const insights = this.generateEnhancedInsights(officeCosts, input);
    const riskScore = this.calculateEnhancedRiskScore(officeCosts, input);
    const recommendedGrants = this.findRecommendedGrants(input);

    return {
      totalCost: totalCostUSD,
      totalWithGrants: totalWithGrantsUSD,
      potentialSavings: totalCostUSD - totalWithGrantsUSD,
      officeCosts,
      insights,
      riskScore,
      recommendedGrants,
      exchangeRatesUsed: Object.fromEntries(this.exchangeRates)
    };
  }

  private async calculateEnhancedOfficeCosts(
    officeCode: string,
    input: EnhancedCostCalculationInput
  ): Promise<EnhancedOfficeCostBreakdown> {
    const fees = this.feeData.get(officeCode) || [];
    const currency = this.getCurrency(officeCode);
    
    const costs = {
      filing: 0,
      search: 0,
      examination: 0,
      issue: 0,
      maintenance: 0,
      claimsExtra: 0,
      pagesExtra: 0,
      designations: 0,
      total: 0,
      discountedTotal: 0
    };

    const timeline: Array<{
      year: number;
      description: string;
      amount: number;
      feeType: string;
      isRequired: boolean;
    }> = [];

    // Calculate base fees using enhanced structure
    costs.filing = this.getEnhancedFeeAmount(fees, 'filing', input.entityType, officeCode);
    costs.search = this.getEnhancedFeeAmount(fees, 'search', input.entityType, officeCode);
    costs.examination = this.getEnhancedFeeAmount(fees, 'examination', input.entityType, officeCode);
    costs.issue = this.getEnhancedFeeAmount(fees, 'issue', input.entityType, officeCode);

    // Calculate additional fees based on claims and pages
    if (input.claimCount && input.claimCount > 15) {
      costs.claimsExtra = this.calculateClaimsFees(fees, input.claimCount, input.entityType);
    }

    if (input.pageCount && input.pageCount > 30) {
      costs.pagesExtra = this.calculatePagesFees(fees, input.pageCount);
    }

    // EPO-specific designation fees
    if (officeCode === 'EPO') {
      costs.designations = this.calculateDesignationFees(fees);
    }

    // Add to timeline with proper scheduling
    this.addToTimeline(timeline, costs, input.lifecycleYears);

    // Calculate maintenance/renewal fees with proper scheduling
    costs.maintenance = this.calculateEnhancedMaintenanceFees(fees, input, timeline, officeCode);

    costs.total = costs.filing + costs.search + costs.examination + costs.issue + 
                  costs.maintenance + costs.claimsExtra + costs.pagesExtra + costs.designations;

    // Apply grants and subsidies
    const applicableGrants = this.findApplicableGrants(officeCode, input);
    costs.discountedTotal = this.applyGrants(costs.total, applicableGrants);

    return {
      office: officeCode,
      currency,
      costs,
      timeline: timeline.sort((a, b) => a.year - b.year),
      applicableGrants
    };
  }

  private getEnhancedFeeAmount(fees: any[], category: string, entityType: string, office: string): number {
    const relevantFees = fees.filter(fee => 
      fee.fee_category === category && fee.lifecycle_stage === 'pre-grant'
    );

    if (relevantFees.length === 0) return 0;

    const fee = relevantFees[0];
    
    // Handle different office structures
    if (office === 'USPTO') {
      switch (entityType) {
        case 'micro': return parseFloat(fee.micro_entity_fee || '0');
        case 'small': return parseFloat(fee.small_entity_fee || '0');
        default: return parseFloat(fee.standard_fee || '0');
      }
    } else {
      // EPO and IPOS don't have entity discounts
      return parseFloat(fee.fee_amount || '0');
    }
  }

  private calculateClaimsFees(fees: any[], claimCount: number, entityType: string): number {
    const claimsFees = fees.filter(fee => fee.fee_category === 'claims');
    if (claimsFees.length === 0) return 0;

    const extraClaims = Math.max(0, claimCount - 15); // First 15 claims typically free
    const feePerClaim = parseFloat(claimsFees[0].fee_amount || '0');
    
    let total = extraClaims * feePerClaim;
    
    // Apply entity discounts for USPTO
    if (entityType === 'micro') total *= 0.25;
    else if (entityType === 'small') total *= 0.5;
    
    return total;
  }

  private calculatePagesFees(fees: any[], pageCount: number): number {
    // Simplified pages calculation - would be more complex in real implementation
    const extraPages = Math.max(0, pageCount - 30);
    return extraPages * 50; // Approximate fee per extra page
  }

  private calculateDesignationFees(fees: any[]): number {
    const designationFees = fees.filter(fee => fee.fee_category === 'designation');
    if (designationFees.length === 0) return 0;
    
    // Simplified - typically select major European countries
    const averageCountries = 5;
    const feePerCountry = parseFloat(designationFees[0].fee_amount || '0');
    
    return averageCountries * feePerCountry;
  }

  private addToTimeline(timeline: any[], costs: any, lifecycleYears: number) {
    // Add initial fees to timeline
    if (costs.filing > 0) timeline.push({ 
      year: 0, description: 'Filing Fee', amount: costs.filing, 
      feeType: 'filing', isRequired: true 
    });
    
    if (costs.search > 0) timeline.push({ 
      year: 0, description: 'Search Fee', amount: costs.search, 
      feeType: 'search', isRequired: true 
    });
    
    if (costs.examination > 0) timeline.push({ 
      year: 1, description: 'Examination Fee', amount: costs.examination, 
      feeType: 'examination', isRequired: true 
    });
    
    if (costs.issue > 0) timeline.push({ 
      year: 2, description: 'Issue/Grant Fee', amount: costs.issue, 
      feeType: 'issue', isRequired: true 
    });
  }

  private calculateEnhancedMaintenanceFees(fees: any[], input: any, timeline: any[], office: string): number {
    const maintenanceFees = fees.filter(fee => 
      fee.fee_category === 'maintenance' || fee.fee_category === 'renewal'
    );

    if (maintenanceFees.length === 0) return 0;

    let total = 0;
    const schedule = this.getMaintenanceSchedule(office);
    
    schedule.forEach(year => {
      if (year <= input.lifecycleYears) {
        // Find specific year fee or use base fee with escalation
        const yearFee = maintenanceFees.find(f => f.year_due === year);
        let amount = 0;
        
        if (yearFee) {
          amount = parseFloat(yearFee.fee_amount || yearFee.standard_fee || '0');
        } else {
          // Use base maintenance fee with yearly escalation
          const baseFee = parseFloat(maintenanceFees[0].fee_amount || maintenanceFees[0].standard_fee || '0');
          amount = baseFee * (1 + (year / 20)); // Fees increase over time
        }

        // Apply entity discounts for USPTO
        if (office === 'USPTO' && input.entityType === 'micro') amount *= 0.25;
        else if (office === 'USPTO' && input.entityType === 'small') amount *= 0.5;

        total += amount;
        timeline.push({
          year,
          description: `Maintenance Fee - Year ${year}`,
          amount,
          feeType: 'maintenance',
          isRequired: true
        });
      }
    });

    return total;
  }

  private getMaintenanceSchedule(office: string): number[] {
    switch (office) {
      case 'USPTO': return [4, 8, 12]; // Years 3.5, 7.5, 11.5 rounded
      case 'EPO': return [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      case 'IPOS': return [5, 10, 15, 20]; // Simplified schedule
      default: return [4, 8, 12, 16, 20];
    }
  }

  private findApplicableGrants(office: string, input: any): any[] {
    const officeCountryMap: Record<string, string> = {
      'USPTO': 'USA',
      'EPO': 'EU', 
      'IPOS': 'Singapore'
    };

    const country = officeCountryMap[office];
    if (!country) return [];

    return this.grantPrograms.filter(grant => {
      if (grant.country !== country) return false;
      
      // Simple eligibility check based on company size and sector
      const criteria = grant.eligibility_criteria;
      
      if (criteria.company_size && input.companySize !== criteria.company_size) return false;
      if (criteria.sector && input.industrySector !== criteria.sector) return false;
      
      return true;
    });
  }

  private applyGrants(totalCost: number, grants: any[]): number {
    let discountedCost = totalCost;

    grants.forEach(grant => {
      const discount = Math.min(
        totalCost * (grant.subsidy_percentage / 100),
        grant.max_subsidy_amount
      );
      discountedCost = Math.max(0, discountedCost - discount);
    });

    return discountedCost;
  }

  private findRecommendedGrants(input: any): any[] {
    return this.grantPrograms.filter(grant => {
      // More sophisticated matching logic could be implemented here
      return true;
    }).slice(0, 3); // Return top 3 recommendations
  }

  private generateEnhancedInsights(officeCosts: any[], input: any): string[] {
    const insights: string[] = [];
    
    // Grant opportunity insights
    const totalSavings = officeCosts.reduce((sum, office) => 
      sum + (office.costs.total - office.costs.discountedTotal), 0
    );

    if (totalSavings > 0) {
      insights.push(`Potential grant savings: $${totalSavings.toLocaleString()} available through various programs`);
    }

    // Claims optimization insights
    if (input.claimCount && input.claimCount > 20) {
      insights.push(`Consider reducing claims count from ${input.claimCount} to 20 to minimize additional fees`);
    }

    // Complex cost analysis
    const maintenancePercentage = officeCosts.reduce((sum, office) => {
      const maintenancePercent = (office.costs.maintenance / office.costs.total) * 100;
      return sum + maintenancePercent;
    }, 0) / officeCosts.length;

    if (maintenancePercentage > 50) {
      insights.push(`Maintenance fees represent ${maintenancePercentage.toFixed(0)}% of total costs - consider shorter protection periods`);
    }

    return insights;
  }

  private calculateEnhancedRiskScore(officeCosts: any[], input: any): number {
    let riskScore = 0.3; // Lower base score for enhanced calculations

    // Risk factors
    if (input.offices.length > 2) riskScore += 0.15;
    if (input.lifecycleYears > 15) riskScore += 0.1;
    if (input.claimCount && input.claimCount > 25) riskScore += 0.1;

    const totalCost = officeCosts.reduce((sum, office) => 
      sum + this.convertToUSD(office.costs.total, office.currency), 0
    );
    
    if (totalCost > 100000) riskScore += 0.2;

    return Math.min(1.0, riskScore);
  }

  private getCurrency(officeCode: string): string {
    const currencyMap: Record<string, string> = {
      'USPTO': 'USD',
      'EPO': 'EUR',
      'IPOS': 'SGD'
    };
    return currencyMap[officeCode] || 'USD';
  }

  private convertToUSD(amount: number, fromCurrency: string): number {
    if (fromCurrency === 'USD') return amount;
    
    const rateKey = `${fromCurrency}_USD`;
    const rate = this.exchangeRates.get(rateKey) || 1;
    return amount * rate;
  }
} 