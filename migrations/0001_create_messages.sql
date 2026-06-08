-- EUReadySeller provider intake messages (D1)
-- Binding: MESSAGE_DB on Cloudflare Pages project eusellerready

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  location TEXT,
  platform TEXT,
  product_category TEXT,
  target_countries TEXT,
  compliance_topics TEXT,
  situation TEXT,
  message TEXT NOT NULL,
  source_page TEXT,
  user_agent_hash TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  raw_payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
