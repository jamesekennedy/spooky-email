-- SpookyEmail Orders Table
-- Stores paid orders for server-side processing

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Customer info
  email VARCHAR(255) NOT NULL,

  -- Job data
  template TEXT NOT NULL,
  csv_headers JSONB NOT NULL,
  csv_data JSONB NOT NULL,
  emails_per_contact INTEGER DEFAULT 3,

  -- Pricing
  contact_count INTEGER NOT NULL,
  total_emails INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,

  -- Processing status
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Results
  results JSONB,
  error_message TEXT,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0
);

-- Index for queue processing (find pending orders quickly)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
