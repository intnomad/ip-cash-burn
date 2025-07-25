'use client';

import FreeCostPreview from '@/components/FreeCostPreview';

const mockData = {
  totalCost: 75220,
  yearlyBreakdown: [
    { year: 0, cost: 29275 },
    { year: 1, cost: 5000 },
    { year: 2, cost: 4000 },
    { year: 3, cost: 3000 },
    { year: 4, cost: 3500 },
    { year: 5, cost: 3000 },
    { year: 6, cost: 3000 },
    { year: 7, cost: 3000 },
    { year: 8, cost: 3000 },
    { year: 9, cost: 3000 },
    { year: 10, cost: 3000 },
    { year: 11, cost: 3000 },
    { year: 12, cost: 3000 },
  ],
  jurisdictionYearlyBreakdown: {
    USPTO: [
      { year: 0, cost: 10000 }, { year: 1, cost: 2000 }, { year: 2, cost: 2000 }, { year: 3, cost: 1000 }, { year: 4, cost: 2000 },
      { year: 5, cost: 1000 }, { year: 6, cost: 1000 }, { year: 7, cost: 1000 }, { year: 8, cost: 1000 }, { year: 9, cost: 1000 },
      { year: 10, cost: 1000 }, { year: 11, cost: 1000 }, { year: 12, cost: 1000 },
    ],
    EPO: [
      { year: 0, cost: 12000 }, { year: 1, cost: 1500 }, { year: 2, cost: 1500 }, { year: 3, cost: 1000 }, { year: 4, cost: 1500 },
      { year: 5, cost: 1000 }, { year: 6, cost: 1000 }, { year: 7, cost: 1000 }, { year: 8, cost: 1000 }, { year: 9, cost: 1000 },
      { year: 10, cost: 1000 }, { year: 11, cost: 1000 }, { year: 12, cost: 1000 },
    ],
    IPOS: [
      { year: 0, cost: 7275 }, { year: 1, cost: 1500 }, { year: 2, cost: 500 }, { year: 3, cost: 1000 }, { year: 4, cost: 1000 },
      { year: 5, cost: 1000 }, { year: 6, cost: 1000 }, { year: 7, cost: 1000 }, { year: 8, cost: 1000 }, { year: 9, cost: 1000 },
      { year: 10, cost: 1000 }, { year: 11, cost: 1000 }, { year: 12, cost: 1000 },
    ],
  },
  jurisdictionCosts: [
    { jurisdiction: 'USPTO', cost: 20000 },
    { jurisdiction: 'EPO', cost: 25000 },
    { jurisdiction: 'IPOS', cost: 15000 },
    { jurisdiction: 'Legal Fees', cost: 8000 },
    { jurisdiction: 'Drawings & Documentation', cost: 4200 },
    { jurisdiction: 'Translation Services', cost: 3020 },
  ],
  cashFlowAlerts: [],
  oneGenericInsight: "💡 Cost-Saving Tip: Consider filing a provisional patent first to secure priority at lower cost.",
  upgradeTeaser: "Get detailed analysis and savings strategies...",
  aiInsights: ["💡 Use micro-entity status for USPTO.", "💡 File in EPO early for grant savings."],
                actionablePlan: [
                "• Assign responsibility for drafting provisional patent applications within 30 days.",
                "• Complete and file provisional patent applications in all three target jurisdictions within 60 days.",
                "• Schedule consultation with our IP team to optimize your filing strategy and reduce costs by 15-25%.",
                "• Set up quarterly IP portfolio reviews to track maintenance costs and renewal deadlines.",
                "• Get in touch with our team to make sure your plan is both cost-effective and optimised to protect your IP portfolio."
  ],
  timeline: {
    filingToGrant: {
      min: 18,
      max: 36,
      average: 24
    },
    prosecutionDelays: 6,
    industryFactor: 1.2
  }
};

export default function TestFreePreview() {
  return (
    <div className="p-8">
      <FreeCostPreview
        previewData={mockData}
        userEmail="test@company.com"
        companyName="Test Company"
        onUpgrade={() => alert('Upgrade!')}
        isLoading={false}
      />
    </div>
  );
} 