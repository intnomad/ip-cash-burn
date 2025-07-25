'use client';

import { useState } from 'react';
import { PatentCalculationInput, PatentCostResult, DetailedPatentCostBreakdown } from '@/types/calculationTypes';
import { AIInsight } from '@/lib/aiInsights';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmailGateModal from '@/components/email-gate-modal';

interface FormData {
  ipType: 'patent' | 'trademark' | 'design';
  industry: string;
  solutionDescription: string;
  jurisdictions: string[];
  solutionComplexity: 'Simple' | 'Complex' | 'Cutting-Edge' | 'Software/Biotech';
  protectionDuration: 10 | 15 | 20;
  filingStrategy?: 'Direct Filing' | 'PCT Route';
  businessDescription?: string;
  estimatedClaims?: number;
  includeLegalAgentFees: boolean;
  includeSearchFees: boolean;
  includeTranslationFees: boolean;
}

interface IPCalculatorFormProps {
  onResults: (results: PatentCostResult | DetailedPatentCostBreakdown, insights: AIInsight[], detailed?: boolean, email?: string) => void;
  onFreeCostPreview?: (previewData: any) => void;
}

export default function IPCalculatorForm({ onResults, onFreeCostPreview }: IPCalculatorFormProps) {
  const [formData, setFormData] = useState<FormData>({
    ipType: 'patent',
    industry: '',
    solutionDescription: '',
    jurisdictions: [],
    solutionComplexity: 'Simple',
    protectionDuration: 20,
    filingStrategy: undefined,
    businessDescription: '',
    estimatedClaims: 20,
    includeLegalAgentFees: true,
    includeSearchFees: true,
    includeTranslationFees: true
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

  const availableJurisdictions = [
    { code: 'USPTO', name: 'United States (USPTO)', flag: '🇺🇸', description: 'US Patent & Trademark Office' },
    { code: 'EPO', name: 'European Union (EPO)', flag: '🇪🇺', description: 'European Patent Office' },
    { code: 'IPOS', name: 'Singapore (IPOS)', flag: '🇸🇬', description: 'Intellectual Property Office of Singapore' }
  ];

  const industries = [
    { value: 'Automotive & Transportation', label: 'Automotive & Transportation' },
    { value: 'Biotechnology & Life Sciences', label: 'Biotechnology & Life Sciences' },
    { value: 'Chemical & Materials', label: 'Chemical & Materials' },
    { value: 'Energy & Cleantech', label: 'Energy & Cleantech' },
    { value: 'Financial Technology (FinTech)', label: 'Financial Technology (FinTech)' },
    { value: 'Food & Agriculture', label: 'Food & Agriculture' },
    { value: 'Healthcare & Medical Devices', label: 'Healthcare & Medical Devices' },
    { value: 'Industrial Manufacturing', label: 'Industrial Manufacturing' },
    { value: 'Information Technology & Software', label: 'Information Technology & Software' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'Semiconductors & Microelectronics', label: 'Semiconductors & Microelectronics' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    { value: 'Other', label: 'Other' }
  ];

  const solutionComplexities = [
    {
      value: 'Simple' as const,
      icon: '⚡',
      name: 'Simple',
      description: 'Basic improvements to existing technology',
      examples: 'Kitchen tools, basic hardware improvements'
    },
    {
      value: 'Complex' as const,
      icon: '⚙️',
      name: 'Complex',
      description: 'Significant technical advancement with multiple components',
      examples: 'Automotive systems, industrial equipment'
    },
    {
      value: 'Cutting-Edge' as const,
      icon: '🔬',
      name: 'Cutting-Edge',
      description: 'Breakthrough technology, first-of-its-kind',
      examples: 'Quantum computing, revolutionary medical devices'
    },
    {
      value: 'Software/Biotech' as const,
      icon: '🧬',
      name: 'Software/Biotech',
      description: 'Specialized complexity for software algorithms or biological processes',
      examples: 'AI algorithms, drug compounds, genetic modifications'
    }
  ];

  const protectionDurations = [
    { value: 10 as const, label: '10 years', description: 'Short-term protection' },
    { value: 15 as const, label: '15 years', description: 'Medium-term protection' },
    { value: 20 as const, label: '20 years (full patent term)', description: 'Maximum protection period' }
  ];

  const handleJurisdictionChange = (jurisdictionCode: string) => {
    setFormData(prev => ({
      ...prev,
      jurisdictions: prev.jurisdictions.includes(jurisdictionCode)
        ? prev.jurisdictions.filter(j => j !== jurisdictionCode)
        : [...prev.jurisdictions, jurisdictionCode]
    }));
  };

  const suggestFilingStrategy = (jurisdictions: string[]): 'Direct Filing' | 'PCT Route' => {
    if (jurisdictions.length <= 2) {
      return 'Direct Filing';
    } else {
      return 'PCT Route';
    }
  };

  const validateForm = () => {
    if (!formData.industry) {
      setError('Please select an industry');
      return false;
    }

    if (!formData.solutionDescription.trim()) {
      setError('Please provide a solution description');
      return false;
    }

    if (formData.solutionDescription.length > 500) {
      setError('Solution description must be 500 characters or less');
      return false;
    }

    if (formData.jurisdictions.length === 0) {
      setError('Please select at least one jurisdiction');
      return false;
    }

    if (formData.jurisdictions.length > 3) {
      setError('Please select 1-3 jurisdictions maximum');
      return false;
    }

    return true;
  };

  const handlePreviewCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('Form submission started');
    console.log('Form data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, showing email modal');
    setIsCalculating(true);
    try {
      // Just validate the form and show email modal
      // The actual API call will be made in the email modal with complete user data
      setCalculatedCost(0); // Will be calculated in email modal
      setShowEmailModal(true);
      console.log('Email modal should be visible now');
    } catch (err) {
      console.error('Preview calculation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate form');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleEmailSubmitWithPreview = (previewData: any) => {
    setShowEmailModal(false);
    if (onFreeCostPreview) {
      onFreeCostPreview(previewData);
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
  };

  // Create form data object for the email modal
  const emailModalFormData = {
    ipType: formData.ipType,
    jurisdictions: formData.jurisdictions,
    duration: formData.protectionDuration,
    sector: formData.industry,
    description: formData.solutionDescription,
    patentComplexity: formData.solutionComplexity,
    includeLegalAgentFees: formData.includeLegalAgentFees,
    includeSearchFees: formData.includeSearchFees,
    includeTranslationFees: formData.includeTranslationFees
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handlePreviewCalculation} className="glass-panel p-8 space-y-8">
        {/* IP Type Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-white mb-4">
            IP Type
            <span className="text-electric-lime ml-2">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Patents - Active */}
            <label
              className={`
                block p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                ${formData.ipType === 'patent'
                  ? 'bg-electric-lime/10 border-electric-lime text-white'
                  : 'bg-navy-dark border-white/10 text-white/70 hover:border-electric-lime/50 hover:bg-electric-lime/5'
                }
              `}
            >
              <input
                type="radio"
                name="ipType"
                className="sr-only"
                checked={formData.ipType === 'patent'}
                onChange={() => setFormData({...formData, ipType: 'patent'})}
              />
              <div className="text-center">
                <div className="text-3xl mb-3">📄</div>
                <div className="font-bold text-lg mb-2">Patents</div>
                <div className="text-sm opacity-80">Protect your inventions & innovations</div>
              </div>
            </label>

            {/* Trademarks - Coming Soon */}
            <label
              className={`
                block p-6 rounded-2xl border-2 transition-all duration-300 group opacity-50 cursor-not-allowed
                bg-navy-dark border-white/10 text-white/40
              `}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">™️</div>
                <div className="font-bold text-lg mb-2">Trademarks</div>
                <div className="text-sm opacity-60">Protect your brand identity</div>
                <div className="text-xs text-electric-lime mt-2 font-medium">Coming Soon</div>
              </div>
            </label>

            {/* Designs - Coming Soon */}
            <label
              className={`
                block p-6 rounded-2xl border-2 transition-all duration-300 group opacity-50 cursor-not-allowed
                bg-navy-dark border-white/10 text-white/40
              `}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">🎨</div>
                <div className="font-bold text-lg mb-2">Designs</div>
                <div className="text-sm opacity-60">Protect your visual designs</div>
                <div className="text-xs text-electric-lime mt-2 font-medium">Coming Soon</div>
              </div>
            </label>
          </div>
        </div>

        {/* Industry Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-white mb-4">
            Industry
            <span className="text-electric-lime ml-2">*</span>
          </label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => setFormData({...formData, industry: value})}
          >
            <SelectTrigger className="input-glass w-full">
              <SelectValue placeholder="Choose your industry..." />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-white/60 text-sm">
            Industry selection helps optimize cost estimates and timeline calculations
          </p>
        </div>

        {/* Solution Description */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-white mb-4">
            Solution Description
            <span className="text-electric-lime ml-2">*</span>
          </label>
          <textarea
            value={formData.solutionDescription}
            onChange={(e) => setFormData({...formData, solutionDescription: e.target.value})}
            className="input-glass w-full min-h-[120px] resize-none"
            placeholder="Describe your invention or solution in detail (max 500 characters)..."
            maxLength={500}
          />
          <div className="flex justify-between text-sm text-white/60">
            <span>Brief description of your invention</span>
            <span>{formData.solutionDescription.length}/500</span>
          </div>
        </div>

        {/* Jurisdictions Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-white mb-4">
            Select Jurisdictions (1-3 required)
            <span className="text-electric-lime ml-2">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableJurisdictions.map((jurisdiction) => (
              <label
                key={jurisdiction.code}
                className={`
                  block p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                  ${formData.jurisdictions.includes(jurisdiction.code)
                    ? 'bg-electric-lime/10 border-electric-lime text-white'
                    : 'bg-navy-dark border-white/10 text-white/70 hover:border-electric-lime/50 hover:bg-electric-lime/5'
                  }
                `}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.jurisdictions.includes(jurisdiction.code)}
                  onChange={() => handleJurisdictionChange(jurisdiction.code)}
                />
                <div className="flex items-center space-x-4">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                    {jurisdiction.flag}
                  </span>
                  <div>
                    <div className="font-bold text-lg">{jurisdiction.name}</div>
                    <div className="text-sm opacity-80">{jurisdiction.description}</div>
                  </div>
                </div>
                {formData.jurisdictions.includes(jurisdiction.code) && (
                  <div className="mt-3 flex items-center">
                    <svg className="w-5 h-5 text-electric-lime" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm font-medium">Selected</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Solution Complexity */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-white mb-4">
            Solution Complexity
            <span className="text-electric-lime ml-2">*</span>
          </label>
          <p className="text-white/60 text-sm -mt-2 mb-4">
            This affects professional fees and prosecution complexity
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solutionComplexities.map((option) => (
              <label
                key={option.value}
                className={`
                  block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                  ${formData.solutionComplexity === option.value
                    ? 'bg-electric-lime/10 border-electric-lime text-white'
                    : 'bg-navy-dark border-white/10 text-white/70 hover:border-electric-lime/50 hover:bg-electric-lime/5'
                  }
                `}
              >
                <input
                  type="radio"
                  name="solutionComplexity"
                  className="sr-only"
                  checked={formData.solutionComplexity === option.value}
                  onChange={() => setFormData({...formData, solutionComplexity: option.value})}
                />
                <div className="text-center">
                  <span className="text-2xl mb-2 block transition-transform duration-300 group-hover:scale-110">
                    {option.icon}
                  </span>
                  <div className="font-bold text-sm mb-1">{option.name}</div>
                  <div className="text-xs opacity-80 mb-2">{option.description}</div>
                  <div className="text-xs opacity-60 italic">{option.examples}</div>
                </div>
                {formData.solutionComplexity === option.value && (
                  <div className="mt-2 flex items-center justify-center">
                    <svg className="w-4 h-4 text-electric-lime" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-xs font-medium">Selected</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Protection Duration */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-white mb-4">
            Duration of Protection
            <span className="text-electric-lime ml-2">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {protectionDurations.map((option) => (
              <label
                key={option.value}
                className={`
                  block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                  ${formData.protectionDuration === option.value
                    ? 'bg-electric-lime/10 border-electric-lime text-white'
                    : 'bg-navy-dark border-white/10 text-white/70 hover:border-electric-lime/50 hover:bg-electric-lime/5'
                  }
                `}
              >
                <input
                  type="radio"
                  name="protectionDuration"
                  className="sr-only"
                  checked={formData.protectionDuration === option.value}
                  onChange={() => setFormData({...formData, protectionDuration: option.value})}
                />
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </div>
                {formData.protectionDuration === option.value && (
                  <div className="mt-2 flex items-center justify-center">
                    <svg className="w-4 h-4 text-electric-lime" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-xs font-medium">Selected</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Filing Strategy Auto-Suggestion */}
        {formData.jurisdictions.length > 0 && (
          <div className="space-y-4">
            <label className="block text-lg font-bold text-white mb-4">
              Recommended Filing Strategy
            </label>
            <div className="p-4 bg-electric-lime/10 border border-electric-lime/30 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-electric-lime" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-bold text-white">
                    {suggestFilingStrategy(formData.jurisdictions)}
                  </div>
                  <div className="text-sm text-white/70">
                    {formData.jurisdictions.length <= 2 
                      ? 'Direct filing recommended for 1-2 jurisdictions'
                      : 'PCT route recommended for 3 jurisdictions to optimize costs and timeline'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Fields */}
        <div className="space-y-6">
          {/* Business Description */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-white">
              Business Description (Optional)
            </label>
            <textarea
              value={formData.businessDescription}
              onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
              className="input-glass w-full min-h-[100px] resize-none"
              placeholder="Describe your business context and market focus..."
            />
            <p className="text-white/60 text-sm">
              Optional but recommended for personalized strategic insights
            </p>
          </div>

          {/* Estimated Claims */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-white">
              Estimated Number of Claims: <span className="text-electric-lime">{formData.estimatedClaims}</span>
            </label>
            <div className="px-3">
              <Slider
                value={[formData.estimatedClaims || 20]}
                onValueChange={(value) => setFormData({...formData, estimatedClaims: value[0]})}
                max={50}
                min={5}
                step={1}
                className="w-full slider-custom"
              />
              <div className="flex justify-between text-sm text-white/60 mt-2">
                <span>5 claims</span>
                <span>50 claims</span>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              Additional claims may incur extra fees in some jurisdictions
            </p>
          </div>

          {/* Cost Inclusions */}
          <div className="space-y-4">
            <label className="block text-lg font-bold text-white">
              Cost Inclusions
            </label>
            <p className="text-white/60 text-sm -mt-2">
              Choose which types of costs to include in your estimate
            </p>
            
            <div className="space-y-3">
              {/* Legal & Agent Fees Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">Legal & Agent Fees</h4>
                    <span className="text-xs px-2 py-1 bg-electric-lime/20 text-electric-lime rounded-full">
                      Market rates
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    Patent attorney drafting, agent filing, prosecution, and IP office services
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeLegalAgentFees}
                    onChange={(e) => setFormData({...formData, includeLegalAgentFees: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-lime"></div>
                </label>
              </div>

              {/* Patent Search Fees Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">Patent Search Fees</h4>
                    <span className="text-xs px-2 py-1 bg-electric-lime/20 text-electric-lime rounded-full">
                      Official fees
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    Prior art search and examination fees required by patent offices
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeSearchFees}
                    onChange={(e) => setFormData({...formData, includeSearchFees: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-lime"></div>
                </label>
              </div>

              {/* Translation Fees Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">Translation Fees</h4>
                    <span className="text-xs px-2 py-1 bg-electric-lime/20 text-electric-lime rounded-full">
                      Fixed rates
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    Document translation for international filings (EPO, etc.)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeTranslationFees}
                    onChange={(e) => setFormData({...formData, includeTranslationFees: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-lime"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={formData.jurisdictions.length === 0 || !formData.industry || !formData.solutionDescription.trim()}
            className="btn-primary w-full text-xl py-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Patent Costs & Timeline
            </div>
          </button>
          <p className="text-white/50 text-sm mt-3 text-center">
            Free preview • Email required for results
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="pt-6 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <div className="w-2 h-2 bg-electric-lime rounded-full"></div>
              Cost estimates
            </div>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <div className="w-2 h-2 bg-electric-lime rounded-full"></div>
              Timeline analysis
            </div>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <div className="w-2 h-2 bg-electric-lime rounded-full"></div>
              Filing strategies
            </div>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <div className="w-2 h-2 bg-electric-lime rounded-full"></div>
              Strategic insights
            </div>
          </div>
        </div>
      </form>

      {showEmailModal && (
        <EmailGateModal
          isOpen={showEmailModal}
          onClose={handleCloseEmailModal}
          onSubmit={handleEmailSubmitWithPreview}
          formData={emailModalFormData}
          cost={calculatedCost}
        />
      )}
    </div>
  );
} 