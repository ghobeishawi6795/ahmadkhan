CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media(owner_id);
