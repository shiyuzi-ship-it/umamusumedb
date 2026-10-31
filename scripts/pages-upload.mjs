#!/usr/bin/env node
// Upload dist/ to Cloudflare Pages assets with an upload JWT (same flow as `wrangler pages deploy`) and write the
// deployment manifest + the MCP "create deployment" snippet. Used with the Cloudflare MCP (no API token needed):
//   1. MCP execute (write_to_file=true): GET /accounts/{id}/pages/projects/umamusumedb/upload-token  -> {jwt}
//   2. node scripts/pages-upload.mjs <file-containing-the-jwt-response> <commit-hash> "<commit message>"
//   3. MCP execute with code "$file:/workspace/deploy/create.js"  -> creates the production deployment
// The JWT is never printed.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(repo + '/node_modules/');
const blake3 = require('blake3-wasm');
const mime = require('mime');

const [jwtFile, commit = 'unknown', message = 'Data update'] = process.argv.slice(2);
if (!jwtFile) throw new Error('usage: node scripts/pages-upload.mjs <jwt-file> [commit] [message]');
const m = readFileSync(jwtFile, 'utf8').match(/eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/);
if (!m) throw new Error('jwt not found in file');
const JWT = m[0];
const root = resolve(repo, 'dist');
const outDir = '/workspace/deploy';
mkdirSync(outDir, { recursive: true });
const SPECIAL = new Set(['_headers', '_redirects', '_worker.js', '_routes.json']);

const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } })(root);
const entries = [];
for (const p of files) {
  const rel = '/' + relative(root, p).split('\\').join('/');
  if (SPECIAL.has(rel.slice(1))) continue;
  const buf = readFileSync(p);
  const b64 = buf.toString('base64');
  entries.push({ rel, hash: blake3.hash(b64 + extname(p).substring(1)).toString('hex').slice(0, 32), b64, size: buf.length, ct: mime.getType(p) || 'application/octet-stream' });
}
console.log('files', entries.length);

const api = async (path, body) => {
  const r = await fetch('https://api.cloudflare.com/client/v4' + path, { method: 'POST', headers: { Authorization: 'Bearer ' + JWT, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(path + ' ' + r.status + ' ' + JSON.stringify(j.errors || j).slice(0, 300));
  return j;
};
const uniq = [...new Set(entries.map((e) => e.hash))];
const miss = new Set((await api('/pages/assets/check-missing', { hashes: uniq })).result);
console.log('unique', uniq.length, 'missing', miss.size);
const byHash = new Map();
for (const e of entries) if (miss.has(e.hash) && !byHash.has(e.hash)) byHash.set(e.hash, e);
const buckets = []; let cur = [], curSize = 0;
for (const e of [...byHash.values()].sort((a, b) => b.size - a.size)) {
  if (cur.length >= 2000 || (curSize + e.size > 40 * 1024 * 1024 && cur.length)) { buckets.push(cur); cur = []; curSize = 0; }
  cur.push(e); curSize += e.size;
}
if (cur.length) buckets.push(cur);
let done = 0;
for (const b of buckets) {
  for (let attempt = 0; ; attempt++) {
    try { await api('/pages/assets/upload', b.map((e) => ({ key: e.hash, value: e.b64, metadata: { contentType: e.ct }, base64: true }))); break; }
    catch (err) { if (attempt >= 3) throw err; await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); }
  }
  done += b.length; console.log('uploaded', done, '/', byHash.size);
}
await api('/pages/assets/upsert-hashes', { hashes: uniq });
const manifest = Object.fromEntries(entries.map((e) => [e.rel, e.hash]));
const readSpecial = (n) => { try { return readFileSync(join(root, n), 'utf8'); } catch { return null; } };
const redirects = readSpecial('_redirects');
const headers = readSpecial('_headers');
const code = `async () => {
  const manifest = ${JSON.stringify(manifest)};
  const form = new FormData();
  form.append('manifest', JSON.stringify(manifest));
  form.append('branch', 'main');
  form.append('commit_hash', ${JSON.stringify(commit)});
  form.append('commit_message', ${JSON.stringify(message)});
  form.append('commit_dirty', 'false');
  ${redirects ? `form.append('_redirects', new Blob([${JSON.stringify(redirects)}], {type:'text/plain'}), '_redirects');` : ''}
  ${headers ? `form.append('_headers', new Blob([${JSON.stringify(headers)}], {type:'text/plain'}), '_headers');` : ''}
  const r = await cloudflare.request({method:'POST', path:\`/accounts/\${accountId}/pages/projects/umamusumedb/deployments\`, body: form});
  return {success:r.success, id:r.result?.id, url:r.result?.url, env:r.result?.environment, errors:r.errors};
}
`;
writeFileSync(join(outDir, 'create.js'), code);
console.log('manifest entries', Object.keys(manifest).length, '-> /workspace/deploy/create.js');
