-- Enhanced Patent Fee Database Migration
-- This script migrates from the current schema to the enhanced structure

-- Step 1: Create the enhanced tables
-- USPTO Patent Fee Table (United States)
CREATE TABLE IF NOT EXISTS uspto_patent_fees_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fee_code TEXT NOT NULL,
    fee_description TEXT NOT NULL,
    standard_fee DECIMAL NOT NULL,
    small_entity_fee DECIMAL NOT NULL,
    micro_entity_fee DECIMAL NOT NULL,
    fee_category TEXT NOT NULL, -- 'filing', 'search', 'examination', 'issue', 'maintenance', 'extension', 'appeal', etc.
    lifecycle_stage TEXT NOT NULL, -- 'pre-grant', 'post-grant'
    is_required BOOLEAN DEFAULT true, -- Some fees are optional
    year_due INTEGER, -- For maintenance fees
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EPO Patent Fee Table (European Union)
CREATE TABLE IF NOT EXISTS epo_patent_fees_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fee_code TEXT NOT NULL,
    fee_description TEXT NOT NULL,
    fee_amount DECIMAL NOT NULL,
    fee_category TEXT NOT NULL, -- 'filing', 'search', 'examination', 'designation', 'claims', 'renewal', etc.
    lifecycle_stage TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    year_due INTEGER, -- For renewal fees
    claims_threshold INTEGER, -- For claims-based fees
    page_threshold INTEGER, -- For page-based fees
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPOS Patent Fee Table (Singapore)
CREATE TABLE IF NOT EXISTS ipos_patent_fees_new (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fee_code TEXT NOT NULL,
    fee_description TEXT NOT NULL,
    fee_amount DECIMAL NOT NULL,
    fee_category TEXT NOT NULL,
    lifecycle_stage TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    year_due INTEGER, -- For renewal fees
    claims_threshold INTEGER, -- For claims-based fees
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency TEXT DEFAULT 'SGD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Migrate existing data with intelligent mapping
-- Migrate USPTO data
INSERT INTO uspto_patent_fees_new (
    fee_code, fee_description, standard_fee, small_entity_fee, micro_entity_fee,
    fee_category, lifecycle_stage, is_required, effective_date, currency
)
SELECT 
    COALESCE(fee_code, 'USPTO_' || id::text) as fee_code,
    COALESCE(description, section, 'Patent Fee') as fee_description,
    COALESCE(standard_fee::decimal, 0) as standard_fee,
    COALESCE(small_entity_fee::decimal, standard_fee::decimal * 0.5, 0) as small_entity_fee,
    COALESCE(micro_entity_fee::decimal, standard_fee::decimal * 0.25, 0) as micro_entity_fee,
    CASE 
        WHEN LOWER(section) LIKE '%filing%' THEN 'filing'
        WHEN LOWER(section) LIKE '%search%' THEN 'search'
        WHEN LOWER(section) LIKE '%examination%' THEN 'examination'
        WHEN LOWER(section) LIKE '%issue%' OR LOWER(section) LIKE '%grant%' THEN 'issue'
        WHEN LOWER(section) LIKE '%maintenance%' OR LOWER(section) LIKE '%renewal%' THEN 'maintenance'
        ELSE 'other'
    END as fee_category,
    CASE 
        WHEN LOWER(section) LIKE '%maintenance%' OR LOWER(section) LIKE '%renewal%' THEN 'post-grant'
        ELSE 'pre-grant'
    END as lifecycle_stage,
    true as is_required,
    COALESCE(effective_date, CURRENT_DATE) as effective_date,
    'USD' as currency
FROM uspto_patent_fees;

-- Migrate EPO data
INSERT INTO epo_patent_fees_new (
    fee_code, fee_description, fee_amount, fee_category, lifecycle_stage, 
    is_required, effective_date, currency
)
SELECT 
    COALESCE(fee_code, 'EPO_' || id::text) as fee_code,
    COALESCE(description, category, 'Patent Fee') as fee_description,
    COALESCE(amount_eur::decimal, 0) as fee_amount,
    CASE 
        WHEN LOWER(category) LIKE '%filing%' THEN 'filing'
        WHEN LOWER(category) LIKE '%search%' THEN 'search'
        WHEN LOWER(category) LIKE '%examination%' THEN 'examination'
        WHEN LOWER(category) LIKE '%designation%' THEN 'designation'
        WHEN LOWER(category) LIKE '%claims%' THEN 'claims'
        WHEN LOWER(category) LIKE '%renewal%' THEN 'renewal'
        ELSE 'other'
    END as fee_category,
    CASE 
        WHEN LOWER(category) LIKE '%renewal%' THEN 'post-grant'
        ELSE 'pre-grant'
    END as lifecycle_stage,
    true as is_required,
    COALESCE(effective_date, CURRENT_DATE) as effective_date,
    'EUR' as currency
FROM epo_patent_fees;

-- Migrate IPOS data
INSERT INTO ipos_patent_fees_new (
    fee_code, fee_description, fee_amount, fee_category, lifecycle_stage,
    is_required, effective_date, currency
)
SELECT 
    COALESCE(fee_code, 'IPOS_' || id::text) as fee_code,
    COALESCE(description, category, 'Patent Fee') as fee_description,
    COALESCE(amount_sgd::decimal, amount::decimal, 0) as fee_amount,
    CASE 
        WHEN LOWER(category) LIKE '%filing%' THEN 'filing'
        WHEN LOWER(category) LIKE '%search%' THEN 'search'
        WHEN LOWER(category) LIKE '%examination%' THEN 'examination'
        WHEN LOWER(category) LIKE '%renewal%' THEN 'renewal'
        ELSE 'other'
    END as fee_category,
    CASE 
        WHEN LOWER(category) LIKE '%renewal%' THEN 'post-grant'
        ELSE 'pre-grant'
    END as lifecycle_stage,
    true as is_required,
    COALESCE(effective_date, CURRENT_DATE) as effective_date,
    'SGD' as currency
FROM ipos_patent_fees;

-- Step 3: Create supporting tables
-- Exchange Rates Table (for multi-currency calculations)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate DECIMAL NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date) VALUES
('USD', 'USD', 1.00, CURRENT_DATE),
('EUR', 'USD', 1.05, CURRENT_DATE),
('SGD', 'USD', 0.74, CURRENT_DATE),
('USD', 'EUR', 0.95, CURRENT_DATE),
('USD', 'SGD', 1.35, CURRENT_DATE),
('EUR', 'SGD', 1.42, CURRENT_DATE);

-- Industry-specific Grant and Subsidy Programs
CREATE TABLE IF NOT EXISTS grant_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_name TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility_criteria JSONB NOT NULL,
    subsidy_percentage DECIMAL,
    max_subsidy_amount DECIMAL,
    currency TEXT NOT NULL,
    application_url TEXT,
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample grant programs
INSERT INTO grant_programs (program_name, country, description, eligibility_criteria, subsidy_percentage, max_subsidy_amount, currency, application_url, effective_date) VALUES
('Small Business Innovation Research (SBIR)', 'USA', 'Federal grant program for small businesses pursuing R&D', '{"company_size": "small", "sector": "technology", "revenue_limit": 5000000}', 75.0, 50000, 'USD', 'https://www.sbir.gov/', CURRENT_DATE),
('Horizon Europe Patent Voucher', 'EU', 'EU program supporting patent applications for innovative SMEs', '{"company_size": "sme", "innovation_level": "high", "eu_based": true}', 50.0, 25000, 'EUR', 'https://ec.europa.eu/horizon-europe', CURRENT_DATE),
('IP Go Global Programme', 'Singapore', 'Support for Singapore companies filing patents internationally', '{"company_location": "singapore", "filing_type": "international"}', 80.0, 20000, 'SGD', 'https://www.ipos.gov.sg/', CURRENT_DATE);

-- Table to store user calculations
CREATE TABLE IF NOT EXISTS user_calculations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL,
    calculation_name TEXT,
    ip_type TEXT NOT NULL, -- 'patent', 'trademark', etc.
    jurisdictions TEXT[] NOT NULL, -- Array of selected jurisdictions
    entity_type TEXT, -- 'standard', 'small', 'micro'
    industry_sector TEXT,
    business_description TEXT,
    duration_years INTEGER NOT NULL,
    claim_count INTEGER DEFAULT 10, -- Approximate number of claims
    page_count INTEGER DEFAULT 30, -- Approximate page count
    basic_result JSONB NOT NULL, -- Basic calculation result (shown before payment)
    detailed_result JSONB, -- Detailed breakdown (shown after payment)
    ai_insights JSONB, -- AI-generated insights
    has_paid BOOLEAN DEFAULT false,
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_uspto_fees_new_category ON uspto_patent_fees_new(fee_category);
CREATE INDEX IF NOT EXISTS idx_uspto_fees_new_lifecycle ON uspto_patent_fees_new(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_uspto_fees_new_dates ON uspto_patent_fees_new(effective_date, expiration_date);

CREATE INDEX IF NOT EXISTS idx_epo_fees_new_category ON epo_patent_fees_new(fee_category);
CREATE INDEX IF NOT EXISTS idx_epo_fees_new_lifecycle ON epo_patent_fees_new(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_epo_fees_new_dates ON epo_patent_fees_new(effective_date, expiration_date);

CREATE INDEX IF NOT EXISTS idx_ipos_fees_new_category ON ipos_patent_fees_new(fee_category);
CREATE INDEX IF NOT EXISTS idx_ipos_fees_new_lifecycle ON ipos_patent_fees_new(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_ipos_fees_new_dates ON ipos_patent_fees_new(effective_date, expiration_date);

CREATE INDEX IF NOT EXISTS idx_user_calculations_email ON user_calculations(user_email);
CREATE INDEX IF NOT EXISTS idx_user_calculations_payment ON user_calculations(has_paid);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup ON exchange_rates(from_currency, to_currency, effective_date);
CREATE INDEX IF NOT EXISTS idx_grant_programs_active ON grant_programs(is_active, country);

-- Step 5: After testing, rename tables to replace old ones
-- ALTER TABLE uspto_patent_fees RENAME TO uspto_patent_fees_old;
-- ALTER TABLE uspto_patent_fees_new RENAME TO uspto_patent_fees;
-- (Repeat for EPO and IPOS tables) 