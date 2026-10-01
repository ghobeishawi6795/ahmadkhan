ALTER TABLE users ADD COLUMN last_login_at TEXT;
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
