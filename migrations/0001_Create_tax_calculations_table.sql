-- Migration number: 0001 	 2025-08-22T14:44:41.652Z

CREATE TABLE tax_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  income REAL,
  filing_status TEXT,
  tax_type TEXT,
  calculated_tax REAL,
  tax_amount_entered REAL,
  calculation_method TEXT, -- 'income_based' or 'direct_entry'
  allocations TEXT, -- JSON string of budget allocations
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_tax_calculations_session_id ON tax_calculations(session_id);
CREATE INDEX idx_tax_calculations_created_at ON tax_calculations(created_at);
CREATE INDEX idx_tax_calculations_filing_status ON tax_calculations(filing_status);
