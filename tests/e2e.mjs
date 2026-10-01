import fs from 'node:fs';
const files=['src/worker.js','public/index.html','public/media-client.js','public/admin-storage.js','migrations/0001_init.sql','wrangler.toml'];
for(const f of files){if(!fs.existsSync(f)) throw new Error(`missing ${f}`)}
const html=fs.readFileSync('public/index.html','utf8');
const worker=fs.readFileSync('src/worker.js','utf8');
const schema=fs.readFileSync('migrations/0001_init.sql','utf8');
const checks=[
 ['frontend calls D1 API',html.includes("api('/messages'")&&html.includes("api('/chats'")],
 ['image/audio input exists',html.includes("accept='image/*,audio/*")],
 ['media upload endpoint wired',html.includes("api('/media/init'")&&html.includes("api('/media/chunk'")&&html.includes("api('/media/complete'")],
 ['worker has native routing',!worker.includes('itty-router')],
 ['membership enforced',worker.includes('isMember(env,chatId,userId)')],
 ['admin role enforced',worker.includes("role='admin'")&&worker.includes("admin_required")],
 ['login rate limit',worker.includes('login_attempts')&&worker.includes('too_many_attempts')],
 ['subscription enforced',worker.includes('subscription_expired')&&worker.includes('hasActiveSubscription')],
 ['password change endpoint',worker.includes('/api/admin/password')],
 ['media access protected',worker.includes('JOIN chat_members cm')],
 ['expiry cleanup scheduled',worker.includes('scheduled')&&worker.includes('expires_at<=datetime')&&worker.includes('complete=0')],
 ['demo data seeded',schema.includes("demo-user")&&schema.includes("INSERT OR IGNORE INTO chats")],
 ['chat metadata preserved in frontend',html.includes('chats=rows.map(x=>({...x,u:x.id,msgs:[]}))')],
 ['message length bounded',worker.includes('message_too_long')&&worker.includes('text.length>10000')],
 ['expired media cannot be completed',worker.includes("complete=0 AND expires_at>datetime('now')")],
 ['D1 only',!fs.readFileSync('wrangler.toml','utf8').includes('r2')]
];
let ok=0; for(const [n,v] of checks){console.log(`${v?'PASS':'FAIL'} ${n}`); if(v)ok++}
if(ok!==checks.length) process.exit(1); console.log(`E2E static gate: ${ok}/${checks.length} PASS`);
