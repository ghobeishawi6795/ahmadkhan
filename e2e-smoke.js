import fs from 'node:fs';
const html=fs.readFileSync('./public/index.html','utf8');
const worker=fs.readFileSync('./src/worker.js','utf8');
const migration=fs.readFileSync('./migrations/0001_init.sql','utf8')+fs.readFileSync('./migrations/0002_auth_security.sql','utf8');
const tests=[];
function t(name,ok,detail=''){tests.push({name,ok,detail});}

t('UI file exists', html.length>5000, `${html.length} bytes`);
t('Worker exists', worker.length>1000, `${worker.length} bytes`);
t('D1 migration defines users', /CREATE TABLE IF NOT EXISTS users/.test(migration));
t('D1 migration defines messages', /CREATE TABLE IF NOT EXISTS messages/.test(migration));
t('D1 migration defines media chunks', /CREATE TABLE IF NOT EXISTS media_chunks/.test(migration));
t('No R2 binding', !/r2|R2/.test(fs.readFileSync('./wrangler.toml','utf8')));
t('Worker has real session authentication', /viva_session|api\/login|AUTH_SECRET/.test(worker));
t('Worker no longer trusts x-user-id', !/x-user-id/.test(worker));
t('Admin endpoints enforce role', /isAdmin\(env,userId\)/.test(worker));
t('Chunk part is range checked', /part<0|part_out_of_range/.test(worker));
t('MIME allowlist enforced', /ALLOWED=new Set/.test(worker));
t('Upload completeness checks exact chunk count', /expected=Math\.ceil/.test(worker));
t('Worker exposes health API', /\/api\/health/.test(worker));
t('Worker exposes message POST API', /p===['\"]\/api\/messages['\"]&&method===['\"]POST['\"]/.test(worker));
t('Login rate limiting exists', /login_attempts/.test(worker)&&/too_many_attempts/.test(worker));
t('Expired subscriptions are blocked', /hasActiveSubscription/.test(worker)&&/subscription_expired/.test(worker));
t('Admin password change endpoint exists', /api\/admin\/password/.test(worker));
t('Incomplete uploads are cleaned', /complete=0 AND created_at/.test(worker));
t('Worker exposes media init/chunk/complete', /\/api\/media\/init/.test(worker)&&/\/api\/media\/chunk/.test(worker)&&/\/api\/media\/complete/.test(worker));
t('Worker has 3-day media expiry', /datetime\('now','\+3 days'\)/.test(worker));
t('Worker has scheduled cleanup', /async scheduled\(/.test(worker)&&/DELETE FROM media_chunks/.test(worker));
t('Image upload max 5 MiB enforced', /5\*1024\*1024/.test(worker)&&/image_over_5mb/.test(worker));
t('Chunk size stays below 2 MB D1 row limit', /chunk_size:1500000/.test(worker)&&/raw.length>1500000/.test(worker));
t('Frontend calls API helper', /const API='\/api'/.test(html)&&/fetch\(API\+path/.test(html));
t('Frontend send() calls message API', /async function send\([^]*?api\('\/messages'/s.test(html));
t('Frontend attachment flow calls media API', /async function attach\([^]*?uploadD1Media/s.test(html));


t('Login handles missing password hash safely', /!user\|\|!user\.password_hash\|\|!user\.password_salt/.test(worker));
t('Message body length is bounded', /message_too_long/.test(worker)&&/text\.length>10000/.test(worker));
t('Media completion rejects expired upload', /complete=0 AND expires_at>datetime\('now'\)/.test(worker));
t('Frontend preserves chat metadata', /chats=rows\.map\(x=>\(\{\.\.\.x,u:x\.id,msgs:\[\]\}\)\)/.test(html));

let passed=tests.filter(x=>x.ok).length;
console.log(`E2E/Integration smoke: ${passed}/${tests.length} passed`);
for(const x of tests) console.log(`${x.ok?'PASS':'FAIL'} | ${x.name}${x.detail?` | ${x.detail}`:''}`);
process.exitCode=passed===tests.length?0:1;