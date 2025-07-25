-- Create tables that match your CSV structure exactly

-- USPTO Patent Fees Table
CREATE TABLE IF NOT EXISTS uspto_patent_fees (
    id SERIAL PRIMARY KEY,
    section TEXT,
    fee_code TEXT,
    cfr_section TEXT,
    description TEXT,
    standard_fee DECIMAL(10,2),
    small_entity_fee DECIMAL(10,2),
    micro_entity_fee DECIMAL(10,2),
    source TEXT DEFAULT 'USPTO',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- EPO Patent Fees Table  
CREATE TABLE IF NOT EXISTS epo_patent_fees (
    id SERIAL PRIMARY KEY,
    fee_code TEXT,
    category TEXT,
    description TEXT,
    amount_eur DECIMAL(10,2),
    notes TEXT,
    source TEXT DEFAULT 'EPO',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- IPOS Patent Fees Table
CREATE TABLE IF NOT EXISTS ipos_patent_fees (
    id SERIAL PRIMARY KEY,
    form_code TEXT,
    category TEXT,
    description TEXT,
    amount_sgd DECIMAL(10,2),
    notes TEXT,
    source TEXT DEFAULT 'IPOS',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_uspto_fees_category ON uspto_patent_fees(section);
CREATE INDEX IF NOT EXISTS idx_epo_fees_category ON epo_patent_fees(category);
CREATE INDEX IF NOT EXISTS idx_ipos_fees_category ON ipos_patent_fees(category);

-- Insert sample data to test (optional)
INSERT INTO uspto_patent_fees (section, fee_code, description, standard_fee, small_entity_fee, micro_entity_fee) 
VALUES ('Patent application filing fees', '1011', 'Basic filing fee - Utility', 350.00, 140.00, 70.00)
ON CONFLICT DO NOTHING;

INSERT INTO epo_patent_fees (fee_code, category, description, amount_eur) 
VALUES ('001', 'Filing Fees', 'Filing fee - EP direct (online)', 135.00)
ON CONFLICT DO NOTHING;

INSERT INTO ipos_patent_fees (form_code, category, description, amount_sgd) 
VALUES ('PF1', 'Filing Fees', 'Request for the Grant of a Patent', 170.00)
ON CONFLICT DO NOTHING; 