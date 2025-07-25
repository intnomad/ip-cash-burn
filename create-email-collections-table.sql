-- Create email_collections table for storing user emails and form data
CREATE TABLE IF NOT EXISTS email_collections (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_type VARCHAR(50),
  jurisdictions TEXT[], -- Array of jurisdiction codes
  duration INTEGER,
  sector VARCHAR(100),
  description TEXT,
  calculated_cost NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_collections_email ON email_collections(email);

-- Create index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_email_collections_created_at ON email_collections(created_at);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE email_collections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for email collection)
CREATE POLICY "Enable insert for anonymous users" ON email_collections
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can view their own emails" ON email_collections
FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'email' = email);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_collections_updated_at 
    BEFORE UPDATE ON email_collections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE email_collections IS 'Stores user emails and IP calculator form data for lead generation';
COMMENT ON COLUMN email_collections.email IS 'User email address';
COMMENT ON COLUMN email_collections.ip_type IS 'Type of IP protection (patent, trademark, design)';
COMMENT ON COLUMN email_collections.jurisdictions IS 'Array of selected jurisdictions (us, eu, sg)';
COMMENT ON COLUMN email_collections.duration IS 'Protection duration in years';
COMMENT ON COLUMN email_collections.sector IS 'Industry sector';
COMMENT ON COLUMN email_collections.description IS 'Brief description of the IP';
COMMENT ON COLUMN email_collections.calculated_cost IS 'Calculated cost estimate in USD'; 