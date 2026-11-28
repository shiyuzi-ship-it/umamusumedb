/* UmamusumeDB 每日闪卡卡包 — Ritual, Daily Lock, Share & Captioned Export */
(function () {
  'use strict';

  const ISSUE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const STORAGE_ISSUES_KEY = 'umadb_holo_issued_v1';
  const STORAGE_DAILY_PREFIX = 'umadb_holo_daily_v1_';
  const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  // 40 / 30 / 30 weight (Daring Tact recent outfit slightly more common, never framed as rarity)
  const CARD_POOL = [
    {
      id: 'daring_tact_107501',
      weight: 40,
      name: 'Daring Tact',
      jpName: 'デアリングタクト',
      outfit: '白光のレガリア',
      isRecentOutfit: true,
      aura: 'moon',
      posterGlow: '#233a63',
      charUrl: 'https://umamusumedb.com/zh/characters/daring_tact_107501/',
      webpPath: '/holo/cards/daring_tact_107501/card.webp',
      compositePath: '/holo/cards/daring_tact_107501/card.webp'
    },
    {
      id: 'special_week_100101',
      weight: 30,
      name: 'Special Week',
      jpName: 'スペシャルウィーク',
      outfit: 'Special Dreamer / スペシャルドリーマー',
      isRecentOutfit: false,
      aura: 'gold',
      posterGlow: '#432746',
      charUrl: 'https://umamusumedb.com/zh/characters/special_week_special_dreamer/',
      webpPath: '/holo/cards/special_week_100101/card.webp',
      compositePath: '/holo/cards/special_week_100101/card.webp'
    },
    {
      id: 'gold_ship_100701',
      weight: 30,
      name: 'Gold Ship',
      jpName: 'ゴールドシップ',
      outfit: 'Red Strife / レッドストライフ',
      isRecentOutfit: false,
      aura: 'rose',
      posterGlow: '#472233',
      charUrl: 'https://umamusumedb.com/zh/characters/gold_ship_red_strife/',
      webpPath: '/holo/cards/gold_ship_100701/card.webp',
      compositePath: '/holo/cards/gold_ship_100701/card.webp'
    }
  ];

  // DOM Elements
  const bodyEl = document.body;
  const stageRoot = document.getElementById('stageRoot');
  const skipBtn = document.getElementById('skipBtn');
  const soundBtn = document.getElementById('soundBtn');
  const soundIconOff = document.getElementById('soundIconOff');
  const soundIconOn = document.getElementById('soundIconOn');

  const packObject = document.getElementById('packObject');
  const packDateLabel = document.getElementById('packDateLabel');
  const openPackBtn = document.getElementById('openPackBtn');
  const fxCanvas = document.getElementById('fxCanvas');

  const cardTiltBox = document.getElementById('cardTiltBox');
  const cardMediaWrap = document.getElementById('cardMediaWrap');
  const heroCardImg = document.getElementById('heroCardImg');
  const webglPane = document.getElementById('webglPane');
  const webglIframe = document.getElementById('webglIframe');

  const tiltHint = document.getElementById('tiltHint');
  const toggle3dBtn = document.getElementById('toggle3dBtn');
  const fullscreen3dLink = document.getElementById('fullscreen3dLink');

  const charJpName = document.getElementById('charJpName');
  const charEnName = document.getElementById('charEnName');
  const charOutfit = document.getElementById('charOutfit');
  const recentWeightNote = document.getElementById('recentWeightNote');
  const issueKicker = document.getElementById('issueKicker');
  const issueCode = document.getElementById('issueCode');

  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const charDbLink = document.getElementById('charDbLink');
  const replayRitualBtn = document.getElementById('replayRitualBtn');
  const openOwnPackLink = document.getElementById('openOwnPackLink');
  const dailyLockNote = document.getElementById('dailyLockNote');

  const copyrightLine = document.getElementById('copyrightLine');
  const hiddenResetBtn = document.getElementById('hiddenResetBtn');
  const packScene = document.getElementById('packScene');
  const packRig = document.getElementById('packRig');
  const packCardSlot = document.getElementById('packCardSlot');
  const cardRig = document.getElementById('cardRig');

  // State
  let currentRecord = null;
  let currentViewContext = { isTodaysOwnDraw: false, isSharedOther: false, isDemoPlay: false };
  let ritualTimers = [];
  let isOpening = false;
  let is3dActive = false;
  let soundEnabled = false;
  let audioCtx = null;
  let countdownInterval = null;

  const PACK_REST = { rx: -8, ry: -18, tx: 0, ty: 0, tz: 0, scale: 1 };
  let poseLocked = false;
  let pointerTilt = null;
  let idleRaf = 0;
  let idleStart = 0;

  function applyPackPose(p) {
    packObject.style.setProperty('--pack-rx', p.rx.toFixed(2) + 'deg');
    packObject.style.setProperty('--pack-ry', p.ry.toFixed(2) + 'deg');
    packObject.style.setProperty('--pack-tx', (p.tx || 0).toFixed(1) + 'px');
    packObject.style.setProperty('--pack-ty', (p.ty || 0).toFixed(1) + 'px');
    packObject.style.setProperty('--pack-tz', (p.tz || 0).toFixed(1) + 'px');
    packObject.style.setProperty('--pack-scale', (p.scale == null ? 1 : p.scale).toFixed(3));
    packObject.style.setProperty('--sheen-x', (50 + p.ry * 1.8).toFixed(1) + '%');
    packObject.style.setProperty('--sheen-y', (42 - p.rx * 1.8).toFixed(1) + '%');
    packObject.style.setProperty('--film-shift-x', (40 + p.ry * 1.6).toFixed(1) + '%');
    packObject.style.setProperty('--film-shift-y', (38 - p.rx * 1.4).toFixed(1) + '%');
    packObject.style.setProperty('--shadow-x', (-p.ry * 0.7).toFixed(1) + 'px');
    packObject.style.setProperty('--shadow-s', (0.92 + Math.max(0, 10 + p.rx) * 0.01).toFixed(3));
  }

  function stopIdleSway() {
    if (idleRaf) {
      cancelAnimationFrame(idleRaf);
      idleRaf = 0;
    }
  }

  function startIdleSway() {
    stopIdleSway();
    if (prefersReducedMotion() || poseLocked) {
      applyPackPose(Object.assign({}, PACK_REST, pointerTilt || {}));
      return;
    }
    idleStart = performance.now();
    const tick = (now) => {
      if (poseLocked || stageRoot.getAttribute('data-stage') !== 'sealed') {
        idleRaf = 0;
        return;
      }
      const t = (now - idleStart) / 1000;
      const baseRx = pointerTilt ? pointerTilt.rx : PACK_REST.rx;
      const baseRy = pointerTilt ? pointerTilt.ry : PACK_REST.ry;
      applyPackPose({
        rx: baseRx + Math.sin(t * 0.7) * 3.4,
        ry: baseRy + Math.sin(t * 0.5 + 0.4) * 10.5,
        tx: 0,
        ty: Math.sin(t * 0.7) * -4,
        tz: 0,
        scale: 1
      });
      idleRaf = requestAnimationFrame(tick);
    };
    idleRaf = requestAnimationFrame(tick);
  }

  function tweenNumeric(from, to, ms, easeFn, onUpdate, onDone) {
    const t0 = performance.now();
    const step = (now) => {
      const u = Math.min(1, (now - t0) / ms);
      const e = easeFn ? easeFn(u) : u;
      onUpdate(from + (to - from) * e, e);
      if (u < 1) {
        const id = requestAnimationFrame(step);
        ritualTimers.push(id);
      } else if (onDone) onDone();
    };
    const id = requestAnimationFrame(step);
    ritualTimers.push(id);
  }

  function easeOutCubic(u) { return 1 - Math.pow(1 - u, 3); }
  function easeInOutCubic(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function easeOutBack(u) {
    const c1 = 1.25, c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }

  const bagPouch = document.getElementById('bagPouch');
  const bagFlap = document.getElementById('bagFlap');

  function jaggedOffset(u, i) {
    return Math.sin(u * 17.3) * 1.15 + Math.sin(u * 41.0) * 0.55 + ((i * 13) % 5 - 2) * 0.28;
  }

  function setTearPct(pct) {
    const t = Math.max(0, Math.min(100, pct));
    packObject.style.setProperty('--tear-pct', t.toFixed(1) + '%');
    if (!bagPouch || !bagFlap) return;
    if (t < 0.35) {
      bagPouch.style.clipPath = '';
      bagFlap.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
      return;
    }
    const x = t / 100;
    const tearY = 7.15; // % of the full bag — bottom of the top crimp
    const flapH = 18;   // .bag-flap height as % of the bag
    const n = 20;
    const pouch = [];
    pouch.push((x * 100).toFixed(2) + '% 0%');
    pouch.push('100% 0%');
    pouch.push('100% 100%');
    pouch.push('0% 100%');
    pouch.push('0% ' + tearY.toFixed(2) + '%');
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const px = u * x * 100;
      const py = tearY + jaggedOffset(u, i);
      pouch.push(px.toFixed(2) + '% ' + py.toFixed(2) + '%');
    }
    pouch.push((x * 100).toFixed(2) + '% 0%');
    bagPouch.style.clipPath = 'polygon(' + pouch.join(',') + ')';

    // Flap uses its own box (top 18% of the bag), so Y is scaled into that box.
    const flap = [];
    flap.push('0% 0%');
    flap.push((x * 100).toFixed(2) + '% 0%');
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      const px = u * x * 100;
      const py = ((tearY + jaggedOffset(u, i)) / flapH) * 100;
      flap.push(px.toFixed(2) + '% ' + Math.min(100, Math.max(0, py)).toFixed(2) + '%');
    }
    bagFlap.style.clipPath = 'polygon(' + flap.join(',') + ')';
  }

  function setCardDraw(yPct, rxDeg, zPx) {
    cardTiltBox.style.setProperty('--card-draw-y', yPct.toFixed(2) + '%');
    if (rxDeg != null) cardTiltBox.style.setProperty('--card-draw-rx', rxDeg.toFixed(2) + 'deg');
    if (zPx != null) cardTiltBox.style.setProperty('--card-draw-z', zPx.toFixed(1) + 'px');
  }

  function nestCardInPack() {
    if (!packCardSlot || !cardTiltBox) return;
    if (cardTiltBox.parentElement !== packCardSlot) {
      packCardSlot.appendChild(cardTiltBox);
    }
    cardRig.classList.add('is-empty');
    cardRig.style.opacity = '0';
    cardRig.style.transform = '';
    setCardDraw(0, 6, 1);
  }

  function restoreCardToRig() {
    if (cardTiltBox.parentElement !== cardRig) {
      const first = cardRig.firstElementChild;
      cardRig.insertBefore(cardTiltBox, first);
    }
    cardTiltBox.style.removeProperty('--card-draw-y');
    cardTiltBox.style.removeProperty('--card-draw-rx');
  }

  function promoteCardFromPack() {
    const r = cardTiltBox.getBoundingClientRect();
    restoreCardToRig();
    cardRig.classList.remove('is-empty');
    cardRig.style.opacity = '1';
    cardRig.style.pointerEvents = 'auto';
    const r2 = cardTiltBox.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (r2.left + r2.width / 2);
    const dy = r.top + r.height / 2 - (r2.top + r2.height / 2);
    const sx = r.width / Math.max(1, r2.width);
    cardRig.style.transition = 'none';
    cardRig.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + sx.toFixed(3) + ')';
    void cardRig.offsetWidth;
    cardRig.style.transition = 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
    cardRig.style.transform = 'none';
  }

  function resetSealedPackChrome() {
    poseLocked = false;
    pointerTilt = null;
    setTearPct(0);
    packObject.classList.remove('is-crumpled');
    packScene.classList.remove('pack-parked');
    packScene.style.opacity = '';
    restoreCardToRig();
    cardRig.classList.add('is-empty');
    cardRig.style.opacity = '0';
    cardRig.style.transform = '';
    cardRig.style.transition = '';
    applyPackPose(PACK_REST);
    startIdleSway();
  }

  // Date & Storage Helpers (Preserved from v1 legacy contract)
  function getLocalYYYYMMDD(dateObj) {
    const d = dateObj || new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const m = {};
    for (const p of parts) if (p.type !== 'literal') m[p.type] = p.value;
    return `${m.year}${m.month}${m.day}`;
  }

  function formatDisplayDate(dateObj) {
    const raw = getLocalYYYYMMDD(dateObj);
    return `${raw.slice(0, 4)} · ${raw.slice(4, 6)} · ${raw.slice(6, 8)}`;
  }

  function msUntilNextShanghaiMidnight(now) {
    const d = now || new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(d);
    const m = {};
    for (const p of parts) if (p.type !== 'literal') m[p.type] = p.value;
    const asIfUtc = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second, d.getUTCMilliseconds());
    const next = Date.UTC(+m.year, +m.month - 1, +m.day + 1, 0, 0, 0, 0);
    return Math.max(0, next - asIfUtc);
  }

  function shareUrlFor(issueId) {
    return `https://umamusumedb.com/zh/holo/${encodeURIComponent(issueId)}`;
  }

  function referralFromParam() {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    return from && /^UMA-\d{8}-[A-HJ-NP-Z2-9]{4}$/.test(from) ? from : null;
  }

  function showPackError(message) {
    const n = document.getElementById('packErrorNote');
    if (!n) { window.alert(message); return; }
    n.hidden = false;
    n.textContent = message;
  }

  function hidePackError() {
    const n = document.getElementById('packErrorNote');
    if (n) { n.hidden = true; n.textContent = ''; }
  }

  function loadIssuedMap() {
    try {
      const raw = localStorage.getItem(STORAGE_ISSUES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveIssuedMap(map) {
    try {
      localStorage.setItem(STORAGE_ISSUES_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function generateUniqueIssueId(yyyymmdd, existingMap) {
    for (let attempt = 0; attempt < 32; attempt++) {
      let suffix = '';
      if (window.crypto && window.crypto.getRandomValues) {
        const bytes = new Uint8Array(4);
        window.crypto.getRandomValues(bytes);
        for (let i = 0; i < 4; i++) {
          suffix += ISSUE_ALPHABET[bytes[i] % ISSUE_ALPHABET.length];
        }
      } else {
        for (let i = 0; i < 4; i++) {
          suffix += ISSUE_ALPHABET[Math.floor(Math.random() * ISSUE_ALPHABET.length)];
        }
      }
      const candidate = `UMA-${yyyymmdd}-${suffix}`;
      if (!existingMap[candidate]) {
        return candidate;
      }
    }
    return `UMA-${yyyymmdd}-Z9X8`;
  }

  function pickWeightedCard() {
    const totalWeight = CARD_POOL.reduce((sum, c) => sum + c.weight, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < CARD_POOL.length; i++) {
      if (roll < CARD_POOL[i].weight) {
        return CARD_POOL[i];
      }
      roll -= CARD_POOL[i].weight;
    }
    return CARD_POOL[0];
  }

  function getCardById(cardId) {
    return CARD_POOL.find(c => c.id === cardId) || CARD_POOL[0];
  }

  function deterministicCardForUnknownShareId(issueId) {
    let hash = 0;
    for (let i = 0; i < issueId.length; i++) {
      hash = (hash * 31 + issueId.charCodeAt(i)) >>> 0;
    }
    return CARD_POOL[hash % CARD_POOL.length];
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // =========================================================================
  // Procedural WebAudio Synthesizer (Optional, Off by Default, Zero Assets)
  // =========================================================================
  function ensureAudioContext() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTearSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.32;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(4600, now + dur);
    filter.Q.value = 1.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  }

  function playSlideSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.45);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  function playRevealChime() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.042;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0008, start);
      gain.gain.linearRampToValueAtTime(0.065 / (1 + idx * 0.2), start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 1.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.3);
    });
  }

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.setAttribute('aria-pressed', String(soundEnabled));
    soundBtn.setAttribute('aria-label', soundEnabled ? '关闭拆包音效' : '开启拆包音效');
    soundBtn.title = soundEnabled ? '音效：已开启' : '音效：已静音';
    soundIconOff.hidden = soundEnabled;
    soundIconOn.hidden = !soundEnabled;
    if (soundEnabled) {
      ensureAudioContext();
    }
  });

  // =========================================================================
  // Lightweight 2D Particle FX Canvas (Only Runs During Active Particles)
  // =========================================================================
  const fxCtx = fxCanvas.getContext('2d');
  let particles = [];
  let fxRaf = 0;

  function resizeFxCanvas() {
    const rect = fxCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    fxCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnTearSparks() {
    resizeFxCanvas();
    const rect = fxCanvas.getBoundingClientRect();
    const seamY = rect.height * 0.25;
    const leftX = rect.width * 0.26;
    const spanW = rect.width * 0.48;
    const palette = ['#fae3ab', '#ffffff', '#efb8c8', '#e6be6a'];
    for (let i = 0; i < 28; i++) {
      const ratio = i / 28;
      particles.push({
        x: leftX + spanW * ratio + (Math.random() - 0.5) * 14,
        y: seamY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.25) * 3.4,
        vy: -Math.random() * 2.8 - 0.6,
        size: 1.6 + Math.random() * 2.4,
        life: 0,
        maxLife: 24 + Math.random() * 20,
        color: palette[i % palette.length]
      });
    }
    ensureFxLoop();
  }

  function spawnRevealMotes() {
    resizeFxCanvas();
    const rect = fxCanvas.getBoundingClientRect();
    const cx = rect.width * 0.5;
    const cy = rect.height * 0.49;
    const palette = ['#fae3ab', '#a2e3ff', '#efb8c8', '#ffffff'];
    for (let i = 0; i < 24; i++) {
      const ang = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.25;
      const rad = 50 + Math.random() * 75;
      particles.push({
        x: cx + Math.cos(ang) * rad * 0.65,
        y: cy + Math.sin(ang) * rad * 0.85,
        vx: Math.cos(ang) * (0.6 + Math.random() * 1.4),
        vy: Math.sin(ang) * (0.6 + Math.random() * 1.4) - 0.35,
        size: 1.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 36 + Math.random() * 24,
        color: palette[i % palette.length]
      });
    }
    ensureFxLoop();
  }

  function ensureFxLoop() {
    if (fxRaf) return;
    function step() {
      const rect = fxCanvas.getBoundingClientRect();
      fxCtx.clearRect(0, 0, rect.width, rect.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035;
        const alpha = 1 - p.life / p.maxLife;
        fxCtx.globalAlpha = alpha;
        fxCtx.fillStyle = p.color;
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fxCtx.fill();
      }
      fxCtx.globalAlpha = 1;
      if (particles.length > 0) {
        fxRaf = requestAnimationFrame(step);
      } else {
        fxRaf = 0;
      }
    }
    fxRaf = requestAnimationFrame(step);
  }

  // =========================================================================
  // Ritual Timing & Card Asset Loading (Loads ONLY the Revealed Card!)
  // =========================================================================
  function clearRitualTimers() {
    while (ritualTimers.length) {
      const id = ritualTimers.pop();
      clearTimeout(id);
      cancelAnimationFrame(id);
    }
  }

  function scheduleBeat(ms, fn) {
    const id = setTimeout(fn, ms);
    ritualTimers.push(id);
  }

  function populateCardDom(record, context) {
    currentRecord = record;
    currentViewContext = Object.assign(
      { isTodaysOwnDraw: false, isSharedOther: false, isDemoPlay: false },
      context || {}
    );
    const card = getCardById(record.cardId);

    // Load ONLY this single card's WebP; reset any previous 3D iframe
    set3dMode(false);
    if (heroCardImg.getAttribute('data-loaded-card') !== card.id) {
      heroCardImg.onerror = function () {
        heroCardImg.onerror = null;
        heroCardImg.src = card.compositePath;
      };
      heroCardImg.src = card.webpPath;
      heroCardImg.setAttribute('data-loaded-card', card.id);
    }
    heroCardImg.alt = `${card.jpName} / ${card.name} — ${card.outfit} (${record.issueId})`;

    if (webglIframe) {
      webglIframe.removeAttribute('src');
      webglIframe.removeAttribute('data-src');
    }
    if (fullscreen3dLink) fullscreen3dLink.hidden = true;
    if (toggle3dBtn) toggle3dBtn.hidden = true;

    charJpName.textContent = card.jpName;
    charEnName.textContent = card.name;
    charOutfit.textContent = card.outfit;
    recentWeightNote.hidden = !card.isRecentOutfit;

    issueKicker.textContent = currentViewContext.isSharedOther ? '分享编号' : '今日编号';
    issueCode.textContent = record.issueId;
    charDbLink.href = card.charUrl;
    charDbLink.removeAttribute('target');

    const streakEl = document.getElementById('streakLine');
    const stampEl = document.getElementById('stampLine');
    if (streakEl) streakEl.textContent = `第 ${record.streak || 1} 日`;
    if (stampEl) {
      stampEl.hidden = !(record.stamps > 0);
      stampEl.textContent = record.stamps > 0 ? `传递 ${record.stamps}` : '';
    }
    const frameOn = !!(record.frame || (record.streak || 0) >= 7);
    cardTiltBox.classList.toggle('has-week-frame', frameOn);
    const physical = cardTiltBox.querySelector('.card-physical');
    if (physical) physical.classList.toggle('has-week-frame', frameOn);

    replayRitualBtn.hidden = !currentViewContext.isTodaysOwnDraw;
    if (openOwnPackLink) openOwnPackLink.hidden = true;

    if (currentViewContext.isTodaysOwnDraw) {
      startDailyCountdown();
      dailyLockNote.hidden = false;
    } else {
      stopDailyCountdown();
      dailyLockNote.hidden = true;
    }
  }

  function updateDailyCountdownText() {
    const diffSec = Math.max(0, Math.floor(msUntilNextShanghaiMidnight() / 1000));
    const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
    const s = String(diffSec % 60).padStart(2, '0');
    dailyLockNote.textContent = `今日卡包已开启 · 距离明日新包 ${h}:${m}:${s}`;
  }

  function startDailyCountdown() {
    updateDailyCountdownText();
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateDailyCountdownText, 1000);
  }

  function stopDailyCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function finalizeRevealImmediate(record, context) {
    clearRitualTimers();
    isOpening = false;
    poseLocked = true;
    stopIdleSway();
    skipBtn.hidden = true;

    populateCardDom(record, context);
    const card = getCardById(record.cardId);
    bodyEl.setAttribute('data-aura', card.aura);
    restoreCardToRig();
    cardRig.classList.remove('is-empty');
    cardRig.style.opacity = '1';
    cardRig.style.transform = 'none';
    cardRig.style.pointerEvents = 'auto';
    packScene.classList.add('pack-parked');
    stageRoot.setAttribute('data-stage', 'revealed');
    stageRoot.setAttribute('data-beat', '0');

    if (!context?.isDemoPlay && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `/zh/holo/${encodeURIComponent(record.issueId)}`);
    }
  }

  function runOpeningRitualForRecord(record, context) {
    if (prefersReducedMotion() && !context?.isDemoPlay) {
      finalizeRevealImmediate(record, context);
      return;
    }

    clearRitualTimers();
    isOpening = true;
    poseLocked = true;
    stopIdleSway();
    pointerTilt = null;
    packScene.classList.remove('pack-parked');
    packScene.style.opacity = '';
    bodyEl.setAttribute('data-aura', 'neutral');
    populateCardDom(record, context);
    nestCardInPack();
    setTearPct(0);
    packObject.classList.remove('is-crumpled');
    applyPackPose({ rx: -8, ry: -14, tx: 0, ty: 0, tz: 24, scale: 1 });

    stageRoot.setAttribute('data-stage', 'opening');
    stageRoot.setAttribute('data-beat', '1');
    skipBtn.hidden = false;

    // Beat 1 (0–1.6s): film stretches at the nick, jagged plastic tear runs across the seal
    playTearSound();
    spawnTearSparks();
    tweenNumeric(0, 100, 1600, easeInOutCubic, (v) => setTearPct(v));

    // Catch, then the torn flap peels and curls back like thin plastic
    scheduleBeat(1750, () => {
      stageRoot.setAttribute('data-beat', '2');
      applyPackPose({ rx: -10, ry: -12, tx: 0, ty: 8, tz: 28, scale: 1 });
    });

    // Beat 3: card slides out of the torn mouth; bag flexes slightly
    scheduleBeat(2650, () => {
      stageRoot.setAttribute('data-beat', '3');
      playSlideSound();
      applyPackPose({ rx: -12, ry: -8, tx: 0, ty: 36, tz: 12, scale: 0.96 });
      tweenNumeric(0, -56, 1700, easeOutCubic, (v, e) => {
        setCardDraw(v, 6 - e * 5, 2);
      });
    });

    // Beat 4: almost-out pause
    scheduleBeat(4400, () => {
      stageRoot.setAttribute('data-beat', '4');
      setCardDraw(-60, 1, 3);
      applyPackPose({ rx: -8, ry: -8, tx: 0, ty: 30, tz: 8, scale: 0.96 });
    });

    // Beat 5: flash, card comes forward, torn bag crumples aside as a floppy object
    scheduleBeat(5100, () => {
      const card = getCardById(record.cardId);
      bodyEl.setAttribute('data-aura', card.aura);
      stageRoot.setAttribute('data-beat', '5');
      playRevealChime();
      spawnRevealMotes();
      promoteCardFromPack();
      packObject.classList.add('is-crumpled');
      applyPackPose({ rx: 18, ry: -42, tz: -30, tx: -108, ty: 110, scale: 0.46 });
    });

    scheduleBeat(6200, () => {
      cardRig.style.transition = '';
      cardRig.style.transform = '';
    });

    scheduleBeat(6500, () => {
      stageRoot.setAttribute('data-beat', '6');
      skipBtn.hidden = true;
      isOpening = false;
      if (!context?.isDemoPlay && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `/zh/holo/${encodeURIComponent(record.issueId)}`);
      }
    });

    scheduleBeat(7600, () => {
      stageRoot.setAttribute('data-stage', 'revealed');
      stageRoot.setAttribute('data-beat', '0');
      packScene.classList.add('pack-parked');
    });
  }

  function issueFromApi(payload) {
    const issue = payload.issue;
    return {
      issueId: issue.id,
      cardId: issue.cardId,
      dateStr: issue.date || payload.date,
      createdAt: issue.createdAt,
      streak: issue.streak || 1,
      stamps: issue.stamps || 0,
      frame: !!issue.frame
    };
  }

  function cacheTodaysRecord(record) {
    try {
      const todayStr = getLocalYYYYMMDD();
      localStorage.setItem(STORAGE_DAILY_PREFIX + todayStr, record.issueId);
      const issuedMap = loadIssuedMap();
      issuedMap[record.issueId] = record;
      saveIssuedMap(issuedMap);
    } catch (e) {}
  }

  async function fetchTodaysIssue() {
    const res = await fetch('/api/holo/today', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('today_failed');
    return res.json();
  }

  async function drawTodaysIssue() {
    const res = await fetch('/api/holo/draw', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ from: referralFromParam() || undefined })
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const err = new Error('daily_cap');
      err.payload = data;
      throw err;
    }
    if (!res.ok || !data.ok || !data.issue) {
      const err = new Error(data.error || 'draw_failed');
      err.payload = data;
      throw err;
    }
    return data;
  }

  async function triggerUserPackOpen() {
    if (isOpening || stageRoot.getAttribute('data-stage') !== 'sealed') return;
    hidePackError();
    isOpening = true;
    try {
      const data = await drawTodaysIssue();
      const record = issueFromApi(data);
      cacheTodaysRecord(record);
      isOpening = false;
      if (data.already) {
        finalizeRevealImmediate(record, { isTodaysOwnDraw: true });
        return;
      }
      runOpeningRitualForRecord(record, { isTodaysOwnDraw: true });
    } catch (err) {
      isOpening = false;
      if (err && err.message === 'daily_cap') {
        showPackError((err.payload && err.payload.message) || '今日开启次数已达上限，请明天再来。');
      } else {
        showPackError('开启失败，请稍后重试。');
      }
    }
  }

  skipBtn.addEventListener('click', () => {
    if (!currentRecord) return;
    finalizeRevealImmediate(currentRecord, currentViewContext);
  });

  openPackBtn.addEventListener('click', () => {
    triggerUserPackOpen();
  });

  replayRitualBtn.addEventListener('click', () => {
    if (!currentRecord || isOpening) return;
    packObject.style.setProperty('--tear-pct', '0%');
    runOpeningRitualForRecord(currentRecord, currentViewContext);
  });

  // =========================================================================
  // Tactile Pack Swipe / Tear / Tap / Keyboard Interaction
  // =========================================================================
  let dragState = null;

  packObject.addEventListener('pointerdown', (e) => {
    if (isOpening || stageRoot.getAttribute('data-stage') !== 'sealed') return;
    if (e.button !== undefined && e.button !== 0) return;
    const rect = packObject.getBoundingClientRect();
    dragState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      width: Math.max(180, rect.width),
      moved: false
    };
    packObject.classList.add('is-interacting');
    try {
      packObject.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  packObject.addEventListener('pointermove', (e) => {
    if (!dragState || stageRoot.getAttribute('data-stage') !== 'sealed' || isOpening) return;
    if (dragState.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (Math.hypot(dx, dy) > 8) dragState.moved = true;

    pointerTilt = {
      ry: PACK_REST.ry + Math.max(-16, Math.min(16, (dx / dragState.width) * 26)),
      rx: PACK_REST.rx + Math.max(-10, Math.min(10, -(dy / 260) * 16))
    };
    applyPackPose(Object.assign({}, PACK_REST, pointerTilt, { ty: -3 }));

    const horizPct = Math.min(100, Math.max(0, (Math.abs(dx) / (dragState.width * 0.42)) * 100));
    setTearPct(horizPct);

    if (Math.abs(dx) >= dragState.width * 0.24 || dy <= -42) {
      dragState = null;
      packObject.classList.remove('is-interacting');
      triggerUserPackOpen();
    }
  });

  function endPackPointer(e) {
    if (!dragState) return;
    const wasTap = !dragState.moved;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    dragState = null;
    packObject.classList.remove('is-interacting');
    pointerTilt = null;

    if (wasTap || Math.abs(dx) >= 32 || dy <= -32) {
      triggerUserPackOpen();
    } else {
      setTearPct(0);
    }
  }

  packObject.addEventListener('pointerup', endPackPointer);
  packObject.addEventListener('pointercancel', () => {
    dragState = null;
    packObject.classList.remove('is-interacting');
    pointerTilt = null;
    setTearPct(0);
  });

  packObject.addEventListener('mousemove', (e) => {
    if (dragState || isOpening || poseLocked || stageRoot.getAttribute('data-stage') !== 'sealed') return;
    const rect = packObject.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    pointerTilt = {
      ry: PACK_REST.ry + nx * 16,
      rx: PACK_REST.rx + (-ny * 10)
    };
  });

  packObject.addEventListener('mouseleave', () => {
    if (dragState) return;
    pointerTilt = null;
  });

  packObject.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerUserPackOpen();
    }
  });

  // =========================================================================
  // Post-Reveal Card Tilt Inspection + Lazy 3D WebGL2 Mode Toggle
  // =========================================================================
  function applyCardTiltFromPoint(clientX, clientY) {
    if (is3dActive) return;
    const st = stageRoot.getAttribute('data-stage');
    const bt = stageRoot.getAttribute('data-beat');
    if (st !== 'revealed' && bt !== '5' && bt !== '6') return;

    const rect = cardTiltBox.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / Math.max(1, rect.height)));
    const ry = (px - 0.5) * 24;
    const rx = (0.5 - py) * 18;

    cardTiltBox.classList.add('is-tilting');
    cardTiltBox.style.setProperty('--tilt-rx', `${rx.toFixed(2)}deg`);
    cardTiltBox.style.setProperty('--tilt-ry', `${ry.toFixed(2)}deg`);
    cardTiltBox.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
    cardTiltBox.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
    cardTiltBox.style.setProperty('--glare-alpha', '1');
  }

  function resetCardTilt() {
    cardTiltBox.classList.remove('is-tilting');
    cardTiltBox.style.setProperty('--tilt-rx', '0deg');
    cardTiltBox.style.setProperty('--tilt-ry', '0deg');
    cardTiltBox.style.setProperty('--glare-alpha', '0');
  }

  let cardTouchActive = false;
  cardTiltBox.addEventListener('pointerdown', (e) => {
    if (is3dActive) return;
    cardTouchActive = true;
    applyCardTiltFromPoint(e.clientX, e.clientY);
  });

  cardTiltBox.addEventListener('pointermove', (e) => {
    if (is3dActive) return;
    if (e.pointerType === 'mouse' || cardTouchActive) {
      applyCardTiltFromPoint(e.clientX, e.clientY);
    }
  });

  cardTiltBox.addEventListener('pointerup', () => {
    cardTouchActive = false;
    resetCardTilt();
  });
  cardTiltBox.addEventListener('pointercancel', () => {
    cardTouchActive = false;
    resetCardTilt();
  });
  cardTiltBox.addEventListener('pointerleave', () => {
    cardTouchActive = false;
    resetCardTilt();
  });

  function set3dMode(enable) {
    is3dActive = !!enable;
    toggle3dBtn.setAttribute('aria-pressed', String(is3dActive));
    toggle3dBtn.textContent = is3dActive ? '返回纯净卡面' : '切换 3D 实时检视';
    fullscreen3dLink.hidden = !is3dActive;
    tiltHint.textContent = is3dActive ? '3D 实时光效已开启' : '轻触拖动卡面可倾斜赏光';
    resetCardTilt();

    if (is3dActive) {
      const src = webglIframe.getAttribute('data-src');
      if (src && !webglIframe.getAttribute('src')) {
        webglIframe.setAttribute('src', src);
      }
      cardMediaWrap.hidden = true;
      webglPane.hidden = false;
    } else {
      webglPane.hidden = true;
      cardMediaWrap.hidden = false;
    }
  }

  toggle3dBtn.addEventListener('click', () => {
    set3dMode(!is3dActive);
  });

  // =========================================================================
  // Copy Share Link & Captioned PNG Download (Works on HTTP and file://)
  // =========================================================================
  copyLinkBtn.addEventListener('click', () => {
    if (!currentRecord) return;
    const shareUrl = shareUrlFor(currentRecord.issueId);
    const prevText = copyLinkBtn.textContent;

    const showSuccess = () => {
      copyLinkBtn.textContent = '✓ 已复制分享链接';
      setTimeout(() => {
        copyLinkBtn.textContent = prevText;
      }, 2000);
    };

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(ta);
      showSuccess();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(showSuccess).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });

  function loadImageElement(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  function loadLazyStillDataUri(card) {
    return new Promise((resolve, reject) => {
      if (window.__PACK_STILLS__ && window.__PACK_STILLS__[card.id]) {
        resolve(window.__PACK_STILLS__[card.id]);
        return;
      }
      const s = document.createElement('script');
      s.src = card.stillScript;
      s.onload = () => {
        if (window.__PACK_STILLS__ && window.__PACK_STILLS__[card.id]) {
          resolve(window.__PACK_STILLS__[card.id]);
        } else {
          reject(new Error('Missing still data'));
        }
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function renderCaptionedPosterToCanvas(artImg, card, record, isCompositeSource) {
    const W = 900;
    const H = 1280;
    const captionTop = 1118;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Deep midnight navy collector backdrop
    const bgGrad = ctx.createRadialGradient(W * 0.5, captionTop * 0.46, 40, W * 0.5, captionTop * 0.5, W * 0.78);
    bgGrad.addColorStop(0, card.posterGlow || '#1d2d52');
    bgGrad.addColorStop(0.55, '#0b1226');
    bgGrad.addColorStop(1, '#050811');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle outer gold hairline frame
    ctx.strokeStyle = 'rgba(230, 190, 106, 0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Draw unmodified card artwork strictly above the caption bar (never touching face/art)
    if (isCompositeSource) {
      // Crop panel 0 (0..460 x 640 front card on studio dark) so QA checkerboard is never shown
      const srcW = Math.min(460, artImg.naturalWidth);
      const srcH = artImg.naturalHeight;
      const dstH = 1000;
      const dstW = Math.round(dstH * (srcW / srcH));
      const dstX = Math.round((W - dstW) / 2);
      const dstY = Math.round((captionTop - dstH) / 2) + 8;
      ctx.drawImage(artImg, 0, 0, srcW, srcH, dstX, dstY, dstW, dstH);
    } else {
      const dstH = 1060;
      const dstW = Math.round(dstH * (artImg.naturalWidth / artImg.naturalHeight));
      const dstX = Math.round((W - dstW) / 2);
      const dstY = Math.round((captionTop - dstH) / 2) + 6;
      ctx.drawImage(artImg, dstX, dstY, dstW, dstH);
    }

    if (record.frame || (record.streak || 0) >= 7) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 227, 171, 0.9)';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 28, W - 72, captionTop - 56);
      ctx.strokeStyle = 'rgba(250, 227, 171, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 16, W - 48, captionTop - 32);
      ctx.fillStyle = '#fae3ab';
      ctx.font = '600 18px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('七日纪念框', W / 2, 36);
      ctx.restore();
    }

    // Dedicated bottom caption plaque below the card
    ctx.fillStyle = '#070b17';
    ctx.fillRect(21, captionTop, W - 42, H - captionTop - 21);

    ctx.strokeStyle = 'rgba(230, 190, 106, 0.34)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(44, captionTop);
    ctx.lineTo(W - 44, captionTop);
    ctx.stroke();

    // Row 1: Character Name (Left) + Issue ID (Right)
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f5f7fc';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans JP", sans-serif';
    ctx.fillText(`${card.jpName} / ${card.name}  ·  ${card.outfit}`, 48, captionTop + 56);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fae3ab';
    ctx.font = 'bold 25px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    ctx.fillText(record.issueId, W - 48, captionTop + 56);

    // Row 2: Unofficial disclaimer + umamusumedb.com + © Cygames
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b9bb5';
    ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d5c49a';
    ctx.font = '600 18px -apple-system, "PingFang SC", sans-serif';
    const extras = [`第 ${record.streak || 1} 日`];
    if (record.stamps) extras.push(`传递 ${record.stamps}`);
    ctx.fillText(extras.join('  ·  '), 48, captionTop + 86);

    ctx.fillStyle = '#8b9bb5';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif';
    ctx.fillText('umamusumedb.com  ·  非官方同人预览（免费展示，非官方周边）  ·  Artwork © Cygames, Inc.', 48, captionTop + 122);

    if (record.frame || (record.streak || 0) >= 7) {
      // decorative frame is drawn after the artwork, before the plaque; handled below if coords known
    }

    return canvas;
  }

  function exportCanvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Empty blob'));
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    });
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  downloadPngBtn.addEventListener('click', async () => {
    if (!currentRecord || downloadPngBtn.disabled) return;
    const card = getCardById(currentRecord.cardId);
    const prevLabel = downloadPngBtn.textContent;
    downloadPngBtn.disabled = true;
    downloadPngBtn.textContent = '生成纪念图中…';
    const filename = `${currentRecord.issueId}_${card.id}.png`;

    try {
      let exportedBlob = null;
      const srcImg = heroCardImg.complete && heroCardImg.naturalWidth > 10
        ? heroCardImg
        : await loadImageElement(card.webpPath);
      const canvas = renderCaptionedPosterToCanvas(srcImg, card, currentRecord, false);
      exportedBlob = await exportCanvasToBlob(canvas);

      triggerBlobDownload(exportedBlob, filename);
      downloadPngBtn.textContent = '✓ 已保存纪念图';
      setTimeout(() => {
        downloadPngBtn.textContent = prevLabel;
        downloadPngBtn.disabled = false;
      }, 1800);
    } catch (err) {
      // Ultimate fallback download
      const a = document.createElement('a');
      a.href = card.compositePath;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      downloadPngBtn.textContent = prevLabel;
      downloadPngBtn.disabled = false;
    }
  });

  // =========================================================================
  // Production init: Shanghai day, server draw, no demo bypass, unknown IDs never hashed.
  async function init() {
    if (packDateLabel) packDateLabel.textContent = formatDisplayDate();

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');
    const idPattern = /^UMA-(\d{8})-([A-HJ-NP-Z2-9]{4})$/;
    if (requestedId && idPattern.test(requestedId)) {
      window.location.replace('/zh/holo/' + encodeURIComponent(requestedId) + (params.get('from') ? ('?from=' + encodeURIComponent(params.get('from'))) : ''));
      return;
    }

    try {
      const data = await fetchTodaysIssue();
      if (data && data.already && data.issue) {
        const record = issueFromApi(data);
        cacheTodaysRecord(record);
        finalizeRevealImmediate(record, { isTodaysOwnDraw: true });
        return;
      }
    } catch (e) {
      // If the API is briefly unavailable, still show the sealed pack so the visitor can retry.
    }

    stageRoot.setAttribute('data-stage', 'sealed');
    stageRoot.setAttribute('data-beat', '0');
    resetSealedPackChrome();
  }

  init();
})();
