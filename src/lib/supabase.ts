import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmewbcjbbmabmnsxyqhk.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key'

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseKey !== 'placeholder-key'

// Debug logging for Supabase configuration
console.log('Supabase Configuration Debug:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Supabase Key exists:', !!supabaseKey);
console.log('- Supabase Key starts with:', supabaseKey.substring(0, 10) + '...');
console.log('- Is configured:', isSupabaseConfigured);

// Export configuration status
export { isSupabaseConfigured }

// Create clients with fallback handling
export const supabase = createClient(supabaseUrl, supabaseKey)

// For server-side operations with service role (more permissions)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Use service role for email collection to bypass RLS
export const supabaseEmailCollection = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseKey, // Fallback to regular key if service key not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Types for our database tables
export interface EmailCollectionData {
  email: string
  ip_type?: string
  jurisdictions?: string[]
  duration?: number
  sector?: string
  description?: string
  calculated_cost?: number
  created_at?: string
  // New strategic fields
  full_name?: string
  company_name?: string
  industry?: string
  business_stage?: string
  pressing_question?: string
  ip_goals?: string
  has_advisors?: string
}

// Function to save email and form data
export async function saveEmailAndFormData(data: EmailCollectionData) {
  console.log('saveEmailAndFormData called with data:', data);
  console.log('isSupabaseConfigured:', isSupabaseConfigured);
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - skipping email data save. Please set up environment variables.')
    console.warn('Environment variables needed: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY');
    // Return success for development purposes
    return { 
      success: true, 
      data: [{ id: 'dev-mode', ...data }],
      warning: 'Supabase not configured - data not actually saved'
    }
  }

  try {
    console.log('Attempting to insert data into email_collections table...');
    console.log('Using service role client for email collection...');
    const { data: result, error } = await supabaseEmailCollection
      .from('email_collections')
      .insert([
        {
          email: data.email,
          ip_type: data.ip_type,
          jurisdictions: data.jurisdictions,
          duration: data.duration,
          sector: data.sector,
          description: data.description,
          calculated_cost: data.calculated_cost,
          full_name: data.full_name,
          company_name: data.company_name,
          industry: data.industry,
          business_stage: data.business_stage,
          pressing_question: data.pressing_question,
          ip_goals: data.ip_goals,
          has_advisors: data.has_advisors,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error
    }

    console.log('Successfully inserted data into Supabase:', result);
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to save email data:', error)
    return { success: false, error }
  }
}

// Function to check if email already exists
export async function checkEmailExists(email: string) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - skipping email check.')
    return { exists: false, warning: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('email_collections')
      .select('email')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }

    return { exists: !!data, data }
  } catch (error) {
    console.error('Error checking email:', error)
    return { exists: false, error }
  }
} 