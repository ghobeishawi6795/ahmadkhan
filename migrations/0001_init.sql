-- VIVA: Cloudflare D1 only. No R2.
CREATE TABLE IF NOT EXISTS users(
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL UNIQUE,
 role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin','user')),
 subscription_expires_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 kind TEXT NOT NULL DEFAULT 'private',
 title TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_members(
 chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 role TEXT NOT NULL DEFAULT 'member',
 PRIMARY KEY(chat_id,user_id)
);

CREATE TABLE IF NOT EXISTS messages(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
 sender_id TEXT NOT NULL REFERENCES users(id),
 body TEXT,
 media_id INTEGER,
 media_type TEXT,
 media_name TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 owner_id TEXT NOT NULL REFERENCES users(id),
 name TEXT NOT NULL,
 mime TEXT NOT NULL,
 size INTEGER NOT NULL,
 complete INTEGER NOT NULL DEFAULT 0,
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_chunks(
 media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
 part INTEGER NOT NULL,
 data BLOB NOT NULL,
 PRIMARY KEY(media_id,part)
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id,id);
CREATE INDEX IF NOT EXISTS idx_media_expiry ON media(expires_at);
CREATE INDEX IF NOT EXISTS idx_chunks_media ON media_chunks(media_id,part);

INSERT OR IGNORE INTO users(id,username,role,subscription_expires_at) VALUES('admin-1','admin','admin',datetime('now','+3650 days'));
INSERT OR IGNORE INTO users(id,username,role,subscription_expires_at) VALUES('demo-user','demo','user',datetime('now','+365 days'));
INSERT OR IGNORE INTO chats(id,kind,title) VALUES(1,'private','گفتگوی آزمایشی');
INSERT OR IGNORE INTO chat_members(chat_id,user_id,role) VALUES(1,'demo-user','member');
INSERT OR IGNORE INTO chat_members(chat_id,user_id,role) VALUES(1,'admin-1','member');
INSERT OR IGNORE INTO messages(id,chat_id,sender_id,body) VALUES(1,1,'admin-1','سلام! این پیام از D1 آمده است.');
