ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN password_salt TEXT;
UPDATE users SET password_hash='5ZZbsh12l1Wmd9GU/n4nPeGCfiEBVaD1XUoQoZ1WGLY=',password_salt='KjRyYbGKJD77M8r0SnUsoA==' WHERE username='admin' AND password_hash IS NULL;
CREATE TABLE IF NOT EXISTS login_attempts(key TEXT PRIMARY KEY,attempts INTEGER NOT NULL DEFAULT 0,locked_until TEXT);
