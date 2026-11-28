-- umamusumedb-holo (D1) — daily holographic pack issues, streaks, referrals.
-- No raw IP addresses are stored; only a daily-salted hash for a soft cap.

CREATE TABLE IF NOT EXISTS holo_visitors (
  id TEXT PRIMARY KEY,
  last_date TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 1,
  stamps INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS holo_issues (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  visitor_id TEXT,
  streak INTEGER NOT NULL DEFAULT 1,
  referrer_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_holo_issues_date ON holo_issues (issued_date);
CREATE INDEX IF NOT EXISTS idx_holo_issues_visitor_date ON holo_issues (visitor_id, issued_date);

CREATE TABLE IF NOT EXISTS holo_ip_caps (
  cap_key TEXT PRIMARY KEY,
  issued_date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS holo_referrals (
  issuer_visitor_id TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  referred_visitor_id TEXT NOT NULL,
  issue_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (issuer_visitor_id, issued_date, referred_visitor_id)
);
