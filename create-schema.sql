-- Enhanced Patent Cost Calculation Database Schema
-- Run this in your Supabase SQL editor before running the migration script

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (careful with production data!)
DROP TABLE IF EXISTS user_calculations CASCADE;
DROP TABLE IF EXISTS grant_programs CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS ipos_patent_fees CASCADE;
DROP TABLE IF EXISTS epo_patent_fees CASCADE;
DROP TABLE IF EXISTS uspto_patent_fees CASCADE;

-- USPTO Patent Fees Table
CREATE TABLE uspto_patent_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_code VARCHAR(50) UNIQUE NOT NULL,
    fee_description TEXT NOT NULL,
    standard_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    small_entity_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    micro_entity_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    fee_category VARCHAR(100) NOT NULL,
    lifecycle_stage VARCHAR(20) CHECK (lifecycle_stage IN ('pre-grant', 'post-grant')) DEFAULT 'pre-grant',
    is_required BOOLEAN NOT NULL DEFAULT true,
    year_due INTEGER,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EPO Patent Fees Table
CREATE TABLE epo_patent_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_code VARCHAR(50) UNIQUE NOT NULL,
    original_fee_code VARCHAR(50) NOT NULL,
    fee_description TEXT NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    fee_category VARCHAR(100) NOT NULL,
    lifecycle_stage VARCHAR(20) CHECK (lifecycle_stage IN ('pre-grant', 'post-grant')) DEFAULT 'pre-grant',
    is_required BOOLEAN NOT NULL DEFAULT true,
    year_due INTEGER,
    claims_threshold INTEGER,
    page_threshold INTEGER,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPOS Patent Fees Table
CREATE TABLE ipos_patent_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_code VARCHAR(50) UNIQUE NOT NULL,
    original_fee_code VARCHAR(50) NOT NULL,
    fee_description TEXT NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    fee_category VARCHAR(100) NOT NULL,
    lifecycle_stage VARCHAR(20) CHECK (lifecycle_stage IN ('pre-grant', 'post-grant')) DEFAULT 'pre-grant',
    is_required BOOLEAN NOT NULL DEFAULT true,
    year_due INTEGER,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency VARCHAR(3) NOT NULL DEFAULT 'SGD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange Rates Table
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_currency, to_currency, effective_date)
);

-- Grant Programs Table
CREATE TABLE grant_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_name VARCHAR(200) UNIQUE NOT NULL,
    country VARCHAR(50) NOT NULL,
    description TEXT,
    eligibility_criteria JSONB,
    subsidy_percentage INTEGER CHECK (subsidy_percentage >= 0 AND subsidy_percentage <= 100),
    max_subsidy_amount DECIMAL(12,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    application_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Calculations Table (for storing calculation history)
CREATE TABLE user_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    calculation_name VARCHAR(200) NOT NULL,
    ip_type VARCHAR(50) NOT NULL DEFAULT 'patent',
    jurisdictions JSONB NOT NULL,
    entity_type VARCHAR(20) NOT NULL DEFAULT 'standard',
    industry_sector VARCHAR(100),
    business_description TEXT,
    duration_years INTEGER NOT NULL,
    claim_count INTEGER DEFAULT 10,
    page_count INTEGER DEFAULT 30,
    basic_result JSONB NOT NULL,
    detailed_result JSONB,
    ai_insights JSONB,
    has_paid BOOLEAN NOT NULL DEFAULT false,
    payment_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_uspto_fees_category ON uspto_patent_fees(fee_category);
CREATE INDEX idx_uspto_fees_lifecycle ON uspto_patent_fees(lifecycle_stage);
CREATE INDEX idx_uspto_fees_required ON uspto_patent_fees(is_required);
CREATE INDEX idx_uspto_fees_year ON uspto_patent_fees(year_due);

CREATE INDEX idx_epo_fees_category ON epo_patent_fees(fee_category);
CREATE INDEX idx_epo_fees_lifecycle ON epo_patent_fees(lifecycle_stage);
CREATE INDEX idx_epo_fees_required ON epo_patent_fees(is_required);
CREATE INDEX idx_epo_fees_year ON epo_patent_fees(year_due);

CREATE INDEX idx_ipos_fees_category ON ipos_patent_fees(fee_category);
CREATE INDEX idx_ipos_fees_lifecycle ON ipos_patent_fees(lifecycle_stage);
CREATE INDEX idx_ipos_fees_required ON ipos_patent_fees(is_required);
CREATE INDEX idx_ipos_fees_year ON ipos_patent_fees(year_due);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(effective_date);

CREATE INDEX idx_grant_programs_country ON grant_programs(country);
CREATE INDEX idx_grant_programs_active ON grant_programs(is_active);

CREATE INDEX idx_user_calculations_email ON user_calculations(user_email);
CREATE INDEX idx_user_calculations_paid ON user_calculations(has_paid);
CREATE INDEX idx_user_calculations_created ON user_calculations(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE uspto_patent_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE epo_patent_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipos_patent_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to fee data
CREATE POLICY "Enable read access for all users" ON uspto_patent_fees FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON epo_patent_fees FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ipos_patent_fees FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON exchange_rates FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON grant_programs FOR SELECT USING (true);

-- Create policies for user calculations (users can only access their own)
CREATE POLICY "Users can view their own calculations" ON user_calculations FOR SELECT USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert their own calculations" ON user_calculations FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update their own calculations" ON user_calculations FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Grant permissions for service role to insert/update fee data
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant read access to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON user_calculations TO authenticated;

-- Grant read access to anonymous users for fee data only
GRANT SELECT ON uspto_patent_fees TO anon;
GRANT SELECT ON epo_patent_fees TO anon;
GRANT SELECT ON ipos_patent_fees TO anon;
GRANT SELECT ON exchange_rates TO anon;
GRANT SELECT ON grant_programs TO anon;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_uspto_patent_fees_updated_at BEFORE UPDATE ON uspto_patent_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_epo_patent_fees_updated_at BEFORE UPDATE ON epo_patent_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipos_patent_fees_updated_at BEFORE UPDATE ON ipos_patent_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grant_programs_updated_at BEFORE UPDATE ON grant_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_calculations_updated_at BEFORE UPDATE ON user_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for development
INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date) VALUES
('USD', 'SGD', 1.35, '2025-07-01'),
('EUR', 'SGD', 1.45, '2025-07-01'),
('USD', 'EUR', 0.93, '2025-07-01'),
('EUR', 'USD', 1.07, '2025-07-01'),
('SGD', 'USD', 0.74, '2025-07-01'),
('SGD', 'EUR', 0.69, '2025-07-01');

COMMENT ON TABLE uspto_patent_fees IS 'US Patent and Trademark Office fee schedule';
COMMENT ON TABLE epo_patent_fees IS 'European Patent Office fee schedule';
COMMENT ON TABLE ipos_patent_fees IS 'Intellectual Property Office of Singapore fee schedule';
COMMENT ON TABLE exchange_rates IS 'Currency exchange rates for cost conversions';
COMMENT ON TABLE grant_programs IS 'Government and institutional grant programs for patent costs';
COMMENT ON TABLE user_calculations IS 'User patent cost calculation history and results'; 