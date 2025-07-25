"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Shield, Mail, Building, User, Briefcase, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveEmailAndFormData, type EmailCollectionData } from "@/lib/supabase"

interface FormData {
  ipType: string | null
  jurisdictions: string[]
  duration: number
  sector: string
  description: string
  // Patent complexity
  patentComplexity?: string
  // Fee inclusion toggles
  includeLegalAgentFees?: boolean
  includeSearchFees?: boolean
  includeTranslationFees?: boolean
}

interface StrategicFormData {
  fullName: string
  email: string
  companyName: string
  industry: string
  businessStage: string
  pressingQuestion: string
  ipGoals: string
  hasAdvisors: string
  customIndustry?: string
  customStage?: string
}

interface EmailGateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (previewData: any) => void
  cost: number | null
  formData?: FormData
}

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
]

const businessStages = [
  { 
    value: 'pre-seed', 
    label: 'Pre-seed / Idea Stage', 
    description: 'Concept stage, building MVP',
    icon: '💡'
  },
  { 
    value: 'seed', 
    label: 'Seed Stage', 
    description: 'Early traction, seeking initial funding',
    icon: '🌱'
  },
  { 
    value: 'series-a', 
    label: 'Series A', 
    description: 'Scaling product and team',
    icon: '🚀'
  },
  { 
    value: 'series-b-plus', 
    label: 'Series B+', 
    description: 'Expanding markets and operations',
    icon: '📈'
  },
  { 
    value: 'growth', 
    label: 'Growth Stage', 
    description: 'Profitable and scaling rapidly',
    icon: '⚡'
  },
  { 
    value: 'established', 
    label: 'Established Company', 
    description: 'Mature business, multiple products',
    icon: '🏢'
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise', 
    description: 'Large corporation, complex IP needs',
    icon: '🏛️'
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Doesn\'t fit above categories',
    icon: '❓'
  }
]

export default function EmailGateModal({ isOpen, onClose, onSubmit, cost, formData }: EmailGateModalProps) {
  const [strategicData, setStrategicData] = useState<StrategicFormData>({
    email: "",
    fullName: "",
    companyName: "",
    industry: "",
    businessStage: "",
    pressingQuestion: "",
    ipGoals: "",
    hasAdvisors: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showOtherIndustry, setShowOtherIndustry] = useState(false)
  const [showOtherStage, setShowOtherStage] = useState(false)

  const handleInputChange = (field: keyof StrategicFormData, value: string) => {
    setStrategicData(prev => ({ ...prev, [field]: value }))
    
    // Handle "Other" selections
    if (field === 'industry') {
      setShowOtherIndustry(value === 'other')
      if (value !== 'other') {
        setStrategicData(prev => ({ ...prev, customIndustry: '' }))
      }
    }
    if (field === 'businessStage') {
      setShowOtherStage(value === 'other')
      if (value !== 'other') {
        setStrategicData(prev => ({ ...prev, customStage: '' }))
      }
    }
  }

  const validateForm = () => {
    if (!strategicData.email || !strategicData.fullName || !strategicData.companyName || !strategicData.industry || !strategicData.businessStage) {
      setError("Please fill in all required fields")
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(strategicData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError("")

    try {
      // Prepare enhanced data for Supabase
      const emailData: EmailCollectionData = {
        email: strategicData.email.trim(),
        ip_type: formData?.ipType || undefined,
        jurisdictions: formData?.jurisdictions || undefined,
        duration: formData?.duration || undefined,
        sector: formData?.sector || undefined,
        description: formData?.description || undefined,
        calculated_cost: cost || undefined,
        // New strategic fields
        full_name: strategicData.fullName.trim(),
        company_name: strategicData.companyName.trim(),
        industry: strategicData.industry === 'other' && strategicData.customIndustry 
          ? strategicData.customIndustry.trim() 
          : industries.find(ind => ind.value === strategicData.industry)?.label || strategicData.industry,
        business_stage: strategicData.businessStage === 'other' && strategicData.customStage
          ? strategicData.customStage.trim()
          : businessStages.find(stage => stage.value === strategicData.businessStage)?.label || strategicData.businessStage,
        pressing_question: strategicData.pressingQuestion.trim() || undefined,
        ip_goals: strategicData.ipGoals || undefined,
        has_advisors: strategicData.hasAdvisors || undefined
      }

      // Save to Supabase
      console.log('Saving email data to Supabase:', emailData);
      const result = await saveEmailAndFormData(emailData)
      
      if (!result.success) {
        console.error('Failed to save data to Supabase:', result.error);
        throw new Error('Failed to save data')
      }
      
      console.log('Successfully saved data to Supabase:', result);

      console.log('Making API call to /api/free-preview');
      console.log('Request data:', {
        ipType: formData?.ipType || 'patent',
        jurisdictions: formData?.jurisdictions || [],
        industry: emailData.industry,
        description: formData?.description || '',
        companyStage: emailData.business_stage,
        email: strategicData.email.trim(),
        companyName: strategicData.companyName.trim(),
        patentComplexity: formData?.patentComplexity || 'Simple',
        includeLegalAgentFees: formData?.includeLegalAgentFees ?? true,
        includeSearchFees: formData?.includeSearchFees ?? true,
        includeTranslationFees: formData?.includeTranslationFees ?? true
      });

      // Generate free cost preview
      const previewResponse = await fetch('/api/free-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipType: formData?.ipType || 'patent',
          jurisdictions: formData?.jurisdictions || [],
          industry: emailData.industry,
          description: formData?.description || '',
          companyStage: emailData.business_stage,
          email: strategicData.email.trim(),
          companyName: strategicData.companyName.trim(),
          // Patent complexity
          patentComplexity: formData?.patentComplexity || 'Simple',
          // Fee inclusion toggles
          includeLegalAgentFees: formData?.includeLegalAgentFees ?? true,
          includeSearchFees: formData?.includeSearchFees ?? true,
          includeTranslationFees: formData?.includeTranslationFees ?? true
        })
      })

      console.log('API response status:', previewResponse.status);

      // Check if response is JSON
      const contentType = previewResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        throw new Error('Server returned invalid response format');
      }

      const previewData = await previewResponse.json()
      console.log('API response data:', previewData);
      
      if (!previewResponse.ok) {
        console.error('API error:', previewData);
        throw new Error(previewData.error || 'Failed to generate preview')
      }

      // Success - pass preview data and user info to parent
      onSubmit({
        previewData: previewData.data,
        userEmail: strategicData.email.trim(),
        companyName: strategicData.companyName.trim()
      })
    } catch (err) {
      console.error('Error processing submission:', err)
      setError('Failed to process your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-navy-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="glass-panel p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-electric-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-electric-lime" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Get Your Free, AI-Powered IP Strategy Report
            </h2>
            
            <p className="text-white/70 text-lg mb-6">
              Our smart calculator analyzes your business to provide a free, actionable report. Stop guessing and start strategizing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-electric-lime">
                <div className="w-2 h-2 bg-electric-lime rounded-full"></div>
                A personalized IP Cash-Burn estimate
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                Your top 3 IP risks and opportunities
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                A clear, actionable plan to discuss with your team
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name <span className="text-electric-lime">*</span>
                </label>
                <Input
                  type="text"
                  value={strategicData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Work Email <span className="text-electric-lime">*</span>
                </label>
                <Input
                  type="email"
                  value={strategicData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@company.com"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Company Information */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company Name <span className="text-electric-lime">*</span>
              </label>
              <Input
                type="text"
                value={strategicData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Your company name"
                className="form-input"
                required
              />
            </div>

            {/* Business Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Industry <span className="text-electric-lime">*</span>
                  <span className="text-xs text-gray-400 ml-2">What sector are you in?</span>
                </label>
                <Select value={strategicData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Choose your industry..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value} className="dropdown-item-enhanced">
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Custom industry input for "Other" */}
                {showOtherIndustry && (
                  <div className="custom-input-container">
                    <Input
                      type="text"
                      value={strategicData.customIndustry || ''}
                      onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                      placeholder="Please specify your industry..."
                      className="form-input text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Business Stage <span className="text-electric-lime">*</span>
                  <span className="text-xs text-gray-400 ml-2">Current growth phase</span>
                </label>
                <Select value={strategicData.businessStage} onValueChange={(value) => handleInputChange('businessStage', value)}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select your stage..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    {businessStages.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value} className="dropdown-item-enhanced">
                        <div className="stage-item">
                          <span className="stage-icon">{stage.icon}</span>
                          <div className="stage-content">
                            <div className="stage-label">{stage.label}</div>
                            <div className="stage-description">{stage.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Custom stage input for "Other" */}
                {showOtherStage && (
                  <div className="custom-input-container">
                    <Input
                      type="text"
                      value={strategicData.customStage || ''}
                      onChange={(e) => handleInputChange('customStage', e.target.value)}
                      placeholder="Please describe your stage..."
                      className="form-input text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Question */}
            <div>
              <label className="block text-white font-medium mb-2">
                What's your most pressing IP question?
              </label>
              <textarea
                value={strategicData.pressingQuestion}
                onChange={(e) => handleInputChange('pressingQuestion', e.target.value)}
                placeholder="e.g., Should we patent our AI algorithm? How do we protect our brand internationally? What's the best filing strategy for our budget?"
                className="form-input min-h-[100px] resize-none"
                rows={4}
              />
              <p className="text-white/50 text-sm mt-2">
                This helps us generate more relevant strategic insights for your specific situation.
              </p>
            </div>

            {/* IP Goals Question */}
            <div>
              <label className="block text-white font-medium mb-2">
                What are your IP goals right now?
              </label>
              <Select value={strategicData.ipGoals} onValueChange={(value) => handleInputChange('ipGoals', value)}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select your IP goals..." />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  <SelectItem value="file-within-3-months">File within the next 3 months</SelectItem>
                  <SelectItem value="get-investor-ready">Get investor-ready</SelectItem>
                  <SelectItem value="protect-brand-assets">Protect brand assets</SelectItem>
                  <SelectItem value="not-sure-yet">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Legal Advisors Question */}
            <div>
              <label className="block text-white font-medium mb-2">
                Do you already have legal or IP advisors?
              </label>
              <Select value={strategicData.hasAdvisors} onValueChange={(value) => handleInputChange('hasAdvisors', value)}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select your current situation..." />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  <SelectItem value="yes-working-with-firm">Yes, working with a firm</SelectItem>
                  <SelectItem value="no-still-exploring">No, still exploring</SelectItem>
                  <SelectItem value="managing-internally">We're managing it internally</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary w-full text-lg py-4"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-navy-black border-t-transparent rounded-full animate-spin mr-3" />
                  Generating Your Strategic Report...
                </div>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-3" />
                  Get My Free Report & Early Access
                </>
              )}
            </Button>

            <p className="text-white/50 text-xs text-center mt-4">
              By providing your information, you agree to receive your strategic report and updates about BlueLicht services. 
              We respect your privacy and never share your data.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
