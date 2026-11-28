/**
 * umamusumedb-holo
 * Daily holographic pack: draw API, daily cap, streak, pass-on stamps, ZH share pages.
 */
const ISSUE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ISSUE_RE = /^UMA-(\d{8})-([A-HJ-NP-Z2-9]{4})$/;
const ORIGIN = 'https://umamusumedb.com';
const INTRO_PATH = '/zh/tools/daily-pack/';
const INTRO_URL = ORIGIN + INTRO_PATH;
const IP_SOFT_CAP = 3;
const FRAME_STREAK = 7;
const ALLOWED_ORIGINS = new Set([
  'https://umamusumedb.com',
  'https://www.umamusumedb.com',
  'https://umamusumedb.pages.dev',
]);

const CARD_POOL = [
  {
    id: 'daring_tact_107501',
    weight: 40,
    name: 'Daring Tact',
    jpName: 'デアリングタクト',
    outfit: '白光のレガリア',
    slug: 'daring_tact_107501',
    isRecentOutfit: true,
  },
  {
    id: 'special_week_100101',
    weight: 30,
    name: 'Special Week',
    jpName: 'スペシャルウィーク',
    outfit: 'Special Dreamer / スペシャルドリーマー',
    slug: 'special_week_special_dreamer',
    isRecentOutfit: false,
  },
  {
    id: 'gold_ship_100701',
    weight: 30,
    name: 'Gold Ship',
    jpName: 'ゴールドシップ',
    outfit: 'Red Strife / レッドストライフ',
    slug: 'gold_ship_red_strife',
    isRecentOutfit: false,
  },
];

const CARD_BY_ID = new Map(CARD_POOL.map((c) => [c.id, c]));

function shanghaiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const m = {};
  for (const p of parts) if (p.type !== 'literal') m[p.type] = p.value;
  return m;
}

function shanghaiYYYYMMDD(date = new Date()) {
  const p = shanghaiParts(date);
  return `${p.year}${p.month}${p.day}`;
}

function msUntilNextShanghaiMidnight(now = new Date()) {
  const p = shanghaiParts(now);
  const asIfUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second, now.getUTCMilliseconds());
  const next = Date.UTC(+p.year, +p.month - 1, +p.day + 1, 0, 0, 0, 0);
  return Math.max(0, next - asIfUtc);
}

function previousShanghaiDate(yyyymmdd) {
  const y = Number(yyyymmdd.slice(0, 4));
  const mo = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  const dt = new Date(Date.UTC(y, mo - 1, d - 1));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function formatShanghaiDisplay(yyyymmdd) {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)} · ${yyyymmdd.slice(4, 6)} · ${yyyymmdd.slice(6, 8)}`;
}

function randomSuffix() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < 4; i++) out += ISSUE_ALPHABET[bytes[i] & 31];
  return out;
}

function randomVisitorId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function pickWeightedCard() {
  const total = CARD_POOL.reduce((s, c) => s + c.weight, 0);
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  let roll = buf[0] % total;
  for (const card of CARD_POOL) {
    if (roll < card.weight) return card;
    roll -= card.weight;
  }
  return CARD_POOL[0];
}

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEq(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function parseCookies(request) {
  const raw = request.headers.get('Cookie') || '';
  const out = {};
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

async function verifySigned(secret, payload, sig) {
  if (!payload || !sig || sig.length !== 64) return false;
  const expected = await hmacHex(secret, payload);
  return timingSafeEq(expected, sig);
}

function cookie(name, value, maxAge) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${Math.max(1, Math.floor(maxAge))}`,
  ];
  return parts.join('; ');
}

function clientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('True-Client-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
  if (ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(body, status, request, extraHeaders = []) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...corsHeaders(request),
  });
  for (const h of extraHeaders) headers.append('Set-Cookie', h);
  return new Response(JSON.stringify(body), { status, headers });
}

async function signedVisitor(env, cookies) {
  const raw = cookies.uma_holo_vid || '';
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const id = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!/^[0-9a-f]{32}$/.test(id)) return null;
  if (!(await verifySigned(env.HOLO_SIGNING_SECRET, `vid:${id}`, sig))) return null;
  return id;
}

async function signedDaily(env, cookies, today) {
  const raw = cookies.uma_holo_day || '';
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const m = payload.match(/^(\d{8}):(UMA-\d{8}-[A-HJ-NP-Z2-9]{4})$/);
  if (!m || m[1] !== today) return null;
  if (!(await verifySigned(env.HOLO_SIGNING_SECRET, `day:${payload}`, sig))) return null;
  return m[2];
}

async function cookieHeaders(env, visitorId, today, issueId) {
  const vidSig = await hmacHex(env.HOLO_SIGNING_SECRET, `vid:${visitorId}`);
  const dayPayload = `${today}:${issueId}`;
  const daySig = await hmacHex(env.HOLO_SIGNING_SECRET, `day:${dayPayload}`);
  const dayMax = Math.ceil(msUntilNextShanghaiMidnight() / 1000);
  return [
    cookie('uma_holo_vid', `${visitorId}.${vidSig}`, 60 * 60 * 24 * 400),
    cookie('uma_holo_day', `${dayPayload}.${daySig}`, dayMax),
  ];
}

function issuePublic(row, stamps) {
  const card = CARD_BY_ID.get(row.card_id);
  return {
    id: row.id,
    cardId: row.card_id,
    date: row.issued_date,
    createdAt: row.created_at,
    streak: row.streak ?? 1,
    stamps: stamps ?? 0,
    frame: (row.streak ?? 1) >= FRAME_STREAK,
    card: card
      ? {
          id: card.id,
          name: card.name,
          jpName: card.jpName,
          outfit: card.outfit,
          slug: card.slug,
          isRecentOutfit: card.isRecentOutfit,
        }
      : null,
  };
}

async function visitorStamps(env, visitorId) {
  if (!visitorId) return 0;
  const row = await env.DB.prepare('SELECT stamps FROM holo_visitors WHERE id = ?1').bind(visitorId).first();
  return row?.stamps ?? 0;
}

async function loadIssue(env, issueId) {
  const row = await env.DB.prepare('SELECT * FROM holo_issues WHERE id = ?1').bind(issueId).first();
  if (!row) return null;
  const stamps = await visitorStamps(env, row.visitor_id);
  return { row, stamps };
}

async function findTodaysIssue(env, visitorId, today) {
  if (!visitorId) return null;
  const row = await env.DB.prepare(
    'SELECT * FROM holo_issues WHERE visitor_id = ?1 AND issued_date = ?2 ORDER BY created_at DESC LIMIT 1'
  )
    .bind(visitorId, today)
    .first();
  if (!row) return null;
  const stamps = await visitorStamps(env, visitorId);
  return { row, stamps };
}

async function ensureVisitorRow(env, visitorId, today, now, streak) {
  const existing = await env.DB.prepare('SELECT * FROM holo_visitors WHERE id = ?1').bind(visitorId).first();
  if (existing) return existing;
  await env.DB.prepare(
    'INSERT INTO holo_visitors (id, last_date, streak, stamps, created_at, updated_at) VALUES (?1, ?2, ?3, 0, ?4, ?4)'
  )
    .bind(visitorId, today, streak, now)
    .run();
  return { id: visitorId, last_date: today, streak, stamps: 0, created_at: now, updated_at: now };
}

async function nextStreak(env, visitorId, today) {
  const row = visitorId
    ? await env.DB.prepare('SELECT last_date, streak, stamps FROM holo_visitors WHERE id = ?1').bind(visitorId).first()
    : null;
  if (!row) return { streak: 1, stamps: 0, existed: false };
  if (row.last_date === today) return { streak: row.streak || 1, stamps: row.stamps || 0, existed: true };
  if (row.last_date === previousShanghaiDate(today)) {
    return { streak: (row.streak || 1) + 1, stamps: row.stamps || 0, existed: true };
  }
  return { streak: 1, stamps: row.stamps || 0, existed: true };
}

async function ipCapKey(env, request, today) {
  const ip = clientIp(request);
  if (!ip) return null;
  return sha256Hex(`${env.HOLO_SIGNING_SECRET}:${today}:${ip}`);
}

async function checkAndBumpIpCap(env, request, today, now) {
  const key = await ipCapKey(env, request, today);
  if (!key) return { ok: true };
  const row = await env.DB.prepare('SELECT count FROM holo_ip_caps WHERE cap_key = ?1 AND issued_date = ?2')
    .bind(key, today)
    .first();
  const count = row?.count ?? 0;
  if (count >= IP_SOFT_CAP) return { ok: false, count };
  await env.DB.prepare(
    `INSERT INTO holo_ip_caps (cap_key, issued_date, count, updated_at) VALUES (?1, ?2, 1, ?3)
     ON CONFLICT(cap_key) DO UPDATE SET count = count + 1, updated_at = ?3`
  )
    .bind(key, today, now)
    .run();
  return { ok: true, count: count + 1 };
}

async function maybeCreditReferral(env, fromId, visitorId, today, now, newIssueId) {
  if (!fromId || !ISSUE_RE.test(fromId) || !visitorId) return;
  const source = await env.DB.prepare('SELECT id, visitor_id FROM holo_issues WHERE id = ?1').bind(fromId).first();
  if (!source || !source.visitor_id) return;
  if (source.visitor_id === visitorId) return;
  const ins = await env.DB.prepare(
    `INSERT INTO holo_referrals (issuer_visitor_id, issued_date, referred_visitor_id, issue_id, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(issuer_visitor_id, issued_date, referred_visitor_id) DO NOTHING`
  )
    .bind(source.visitor_id, today, visitorId, newIssueId, now)
    .run();
  const added = ins?.meta?.changes === 1 || ins?.meta?.rows_written === 1;
  if (added) {
    await env.DB.prepare(
      'UPDATE holo_visitors SET stamps = stamps + 1, updated_at = ?2 WHERE id = ?1'
    )
      .bind(source.visitor_id, now)
      .run();
  }
}

async function handleToday(request, env) {
  const today = shanghaiYYYYMMDD();
  const cookies = parseCookies(request);
  const visitorId = await signedVisitor(env, cookies);
  const cookieIssue = await signedDaily(env, cookies, today);
  let found = null;
  if (cookieIssue) found = await loadIssue(env, cookieIssue);
  if (!found) found = await findTodaysIssue(env, visitorId, today);
  if (!found) return json({ ok: true, already: false, date: today }, 200, request);
  const headers = visitorId ? await cookieHeaders(env, visitorId, today, found.row.id) : [];
  return json({ ok: true, already: true, date: today, issue: issuePublic(found.row, found.stamps) }, 200, request, headers);
}

async function handleDraw(request, env) {
  const today = shanghaiYYYYMMDD();
  const now = Date.now();
  let fromId = null;
  try {
    const body = await request.json().catch(() => ({}));
    if (body && typeof body.from === 'string' && ISSUE_RE.test(body.from)) fromId = body.from;
  } catch {
    fromId = null;
  }

  const cookies = parseCookies(request);
  let visitorId = await signedVisitor(env, cookies);
  const cookieIssue = await signedDaily(env, cookies, today);

  if (cookieIssue) {
    const found = await loadIssue(env, cookieIssue);
    if (found) {
      const vid = visitorId || found.row.visitor_id || randomVisitorId();
      const headers = await cookieHeaders(env, vid, today, found.row.id);
      return json({ ok: true, already: true, date: today, issue: issuePublic(found.row, found.stamps) }, 200, request, headers);
    }
  }

  if (visitorId) {
    const existing = await findTodaysIssue(env, visitorId, today);
    if (existing) {
      const headers = await cookieHeaders(env, visitorId, today, existing.row.id);
      return json({ ok: true, already: true, date: today, issue: issuePublic(existing.row, existing.stamps) }, 200, request, headers);
    }
  }

  const cap = await checkAndBumpIpCap(env, request, today, now);
  if (!cap.ok) {
    return json({ ok: false, error: 'daily_cap', message: '今日开启次数已达上限，请明天再来。', date: today }, 429, request);
  }

  if (!visitorId) visitorId = randomVisitorId();
  const progress = await nextStreak(env, visitorId, today);
  const streak = progress.streak;

  if (progress.existed) {
    await env.DB.prepare(
      'UPDATE holo_visitors SET last_date = ?2, streak = ?3, updated_at = ?4 WHERE id = ?1'
    )
      .bind(visitorId, today, streak, now)
      .run();
  } else {
    await ensureVisitorRow(env, visitorId, today, now, streak);
  }

  const card = pickWeightedCard();
  let issueId = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `UMA-${today}-${randomSuffix()}`;
    try {
      const ins = await env.DB.prepare(
        `INSERT INTO holo_issues (id, card_id, issued_date, created_at, visitor_id, streak, referrer_id)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
      )
        .bind(candidate, card.id, today, now, visitorId, streak, fromId)
        .run();
      if (ins?.success !== false) {
        issueId = candidate;
        break;
      }
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      if (/UNIQUE|constraint/i.test(msg)) continue;
      throw err;
    }
  }
  if (!issueId) {
    return json({ ok: false, error: 'issue_failed', message: '编号发放失败，请稍后重试。' }, 500, request);
  }

  await maybeCreditReferral(env, fromId, visitorId, today, now, issueId);
  const stamps = await visitorStamps(env, visitorId);
  const headers = await cookieHeaders(env, visitorId, today, issueId);
  const row = {
    id: issueId,
    card_id: card.id,
    issued_date: today,
    created_at: now,
    visitor_id: visitorId,
    streak,
    referrer_id: fromId,
  };
  return json({ ok: true, already: false, date: today, issue: issuePublic(row, stamps) }, 201, request, headers);
}

async function handleIssueJson(request, env, issueId) {
  if (!ISSUE_RE.test(issueId)) {
    return json({ ok: false, error: 'not_found' }, 404, request);
  }
  const found = await loadIssue(env, issueId);
  if (!found) return json({ ok: false, error: 'not_found' }, 404, request);
  return json({ ok: true, issue: issuePublic(found.row, found.stamps) }, 200, request);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shareNotFoundHtml() {
  const title = '未找到这张纪念闪卡 | UmamusumeDB';
  const desc = '这个编号不存在或尚未发放。每日免费一包，随机一张纪念闪卡。';
  return `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="${INTRO_URL}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${INTRO_URL}" />
  <meta property="og:image" content="${ORIGIN}/holo/og/pack.webp" />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:site_name" content="UmamusumeDB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@umamusumedb" />
  <meta name="twitter:image" content="${ORIGIN}/holo/og/pack.webp" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,"PingFang SC","Noto Sans SC",sans-serif;background:#070b17;color:#f5f7fc;padding:24px;}
    .box{max-width:28rem;text-align:center}
    h1{font-size:1.4rem;margin:0 0 12px}
    p{color:#8b9bb5;line-height:1.6}
    a{color:#fae3ab}
    .cta{display:inline-block;margin-top:18px;padding:10px 20px;border-radius:999px;background:linear-gradient(135deg,#f3d48a,#e0b15a);color:#2a1d08;text-decoration:none;font-weight:600}
  </style>
</head>
<body>
  <div class="box">
    <h1>没有找到这个编号</h1>
    <p>分享链接里的编号不存在，或尚未发放。不会随机显示其他闪卡。</p>
    <p><a class="cta" href="/zh/holo/">拆今日卡包</a></p>
    <p><a href="${INTRO_PATH}">了解今日卡包</a> · <a href="/zh/">返回首页</a></p>
  </div>
</body>
</html>`;
}

function sharePageHtml(issue, stamps) {
  const card = CARD_BY_ID.get(issue.card_id);
  if (!card) return shareNotFoundHtml();
  const id = issue.id;
  const pageUrl = `${ORIGIN}/zh/holo/${encodeURIComponent(id)}`;
  const ogImage = `${ORIGIN}/holo/og/${card.id}.webp`;
  const cardImg = `/holo/cards/${card.id}/card.webp`;
  const charUrl = `/zh/characters/${card.slug}/`;
  const title = `${card.jpName} / ${card.name} · ${id} | UmamusumeDB`;
  const desc = `今日卡包纪念闪卡 ${card.jpName}（${card.outfit}），编号 ${id}。非官方同人预览，Artwork © Cygames, Inc.`;
  const streak = issue.streak || 1;
  const stampCount = stamps ?? 0;
  const frame = streak >= FRAME_STREAK;
  const payload = JSON.stringify({
    id,
    cardId: card.id,
    date: issue.issued_date,
    streak,
    stamps: stampCount,
    frame,
    name: card.name,
    jpName: card.jpName,
    outfit: card.outfit,
    slug: card.slug,
    isRecentOutfit: !!card.isRecentOutfit,
  });
  return `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="${INTRO_URL}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:site_name" content="UmamusumeDB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@umamusumedb" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/holo/pack-assets/share.css" />
</head>
<body>
  <header class="share-top">
    <a href="${INTRO_PATH}">今日卡包</a>
    <a href="/zh/">UmamusumeDB</a>
  </header>
  <main class="share-main">
    <div class="share-card-wrap${frame ? ' has-week-frame' : ''}">
      <img class="share-card" src="${cardImg}" alt="${escapeHtml(card.jpName + ' / ' + card.name + ' — ' + card.outfit + ' (' + id + ')')}" width="690" height="960" />
    </div>
    <p class="share-names"><strong>${escapeHtml(card.jpName)}</strong> / ${escapeHtml(card.name)}</p>
    <p class="share-outfit">${escapeHtml(card.outfit)}${card.isRecentOutfit ? ' · 新胜负服稍常见' : ''}</p>
    <p class="share-meta">第 ${streak} 日${stampCount ? ' · 传递 ' + stampCount : ''}${frame ? ' · 七日纪念框' : ''}</p>
    <p class="share-id"><span>编号</span> <code>${escapeHtml(id)}</code></p>
    <div class="share-actions">
      <button type="button" id="downloadPngBtn" class="btn-gold">保存纪念图</button>
      <button type="button" id="copyLinkBtn" class="btn-ghost">复制分享链接</button>
    </div>
    <div class="share-links">
      <a class="btn-gold" href="/zh/holo/?from=${encodeURIComponent(id)}">拆今日卡包</a>
      <a class="btn-ghost" href="${charUrl}">角色资料</a>
    </div>
    <p class="share-foot">非官方同人预览 · 角色立绘版权归 © Cygames, Inc. 所有 · umamusumedb.com · 免费展示，非官方周边</p>
  </main>
  <script type="application/json" id="holoIssue">${payload}</script>
  <script src="/holo/pack-assets/share-page.js" defer></script>
</body>
</html>`;
}

async function handleShare(request, env, issueId) {
  if (!ISSUE_RE.test(issueId)) {
    return new Response(shareNotFoundHtml(), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, follow' },
    });
  }
  const found = await loadIssue(env, issueId);
  if (!found) {
    return new Response(shareNotFoundHtml(), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, follow' },
    });
  }
  return new Response(sharePageHtml(found.row, found.stamps), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, must-revalidate',
      'x-robots-tag': 'noindex, follow',
    },
  });
}

function matchIssuePath(pathname) {
  const m = pathname.match(/^\/zh\/holo\/(UMA-[^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}


const RITUAL_ORIGIN = 'https://umamusumedb.pages.dev';

function isRitualPath(pathname) {
  return pathname === '/zh/holo' || pathname === '/zh/holo/';
}

async function proxyRitual(request, url) {
  const dest = new URL('/zh/holo/', RITUAL_ORIGIN);
  dest.search = url.search;
  dest.hash = url.hash;
  const headers = new Headers(request.headers);
  headers.delete('Host');
  headers.delete('cf-connecting-ip');
  return fetch(dest.toString(), {
    method: request.method,
    headers,
    redirect: 'manual',
  });
}

export default {
  async fetch(request, env) {
    if (!env.DB || !env.HOLO_SIGNING_SECRET) {
      return new Response('holo worker is not configured', { status: 500 });
    }
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS' && path.startsWith('/api/holo')) {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (isRitualPath(path) && (request.method === 'GET' || request.method === 'HEAD')) {
      return proxyRitual(request, url);
    }

    try {
      if (path === '/api/holo/today' && request.method === 'GET') return await handleToday(request, env);
      if (path === '/api/holo/draw' && request.method === 'POST') return await handleDraw(request, env);
      const issueJson = path.match(/^\/api\/holo\/issue\/([^/]+)\/?$/);
      if (issueJson && request.method === 'GET') return await handleIssueJson(request, env, decodeURIComponent(issueJson[1]));
      const shareId = matchIssuePath(path);
      if (shareId && request.method === 'GET') return await handleShare(request, env, shareId);
    } catch (err) {
      if (path.startsWith('/api/')) {
        return json({ ok: false, error: 'server', message: '服务暂时不可用，请稍后重试。' }, 500, request);
      }
      return new Response('Internal error', { status: 500 });
    }

    return json({ ok: false, error: 'not_found' }, 404, request);
  },
};
