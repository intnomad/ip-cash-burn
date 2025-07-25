-- Strategic Fields Migration for email_collections table
-- Run this in your Supabase SQL editor

-- Add new strategic fields to the email_collections table
ALTER TABLE email_collections 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_stage VARCHAR(100),
ADD COLUMN IF NOT EXISTS pressing_question TEXT,
ADD COLUMN IF NOT EXISTS ip_goals VARCHAR(100),
ADD COLUMN IF NOT EXISTS has_advisors VARCHAR(100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_collections_company_name ON email_collections(company_name);
CREATE INDEX IF NOT EXISTS idx_email_collections_industry ON email_collections(industry);
CREATE INDEX IF NOT EXISTS idx_email_collections_business_stage ON email_collections(business_stage);

-- Add comments for documentation
COMMENT ON COLUMN email_collections.full_name IS 'Full name of the person submitting the form';
COMMENT ON COLUMN email_collections.company_name IS 'Company name of the submitter';
COMMENT ON COLUMN email_collections.industry IS 'Industry sector from dropdown selection';
COMMENT ON COLUMN email_collections.business_stage IS 'Business stage from dropdown selection';
COMMENT ON COLUMN email_collections.pressing_question IS 'Most pressing IP question submitted by user';
COMMENT ON COLUMN email_collections.ip_goals IS 'IP goals selected by user';
COMMENT ON COLUMN email_collections.has_advisors IS 'Whether user has legal/IP advisors';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'email_collections' 
ORDER BY ordinal_position; 