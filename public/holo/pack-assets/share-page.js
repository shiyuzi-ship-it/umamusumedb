/* Share / commemorative helpers for /zh/holo/:id and ritual downloads. */
(function () {
  'use strict';
  const el = document.getElementById('holoIssue');
  if (!el) return;
  let record;
  try { record = JSON.parse(el.textContent); } catch (e) { return; }

  const poolGlow = {
    daring_tact_107501: '#233a63',
    special_week_100101: '#432746',
    gold_ship_100701: '#472233',
  };

  function shareUrl() {
    return `https://umamusumedb.com/zh/holo/${encodeURIComponent(record.id)}`;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  function renderCaptionedPoster(artImg, rec) {
    const W = 900;
    const H = 1280;
    const captionTop = 1118;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const glow = poolGlow[rec.cardId] || '#1d2d52';
    const bgGrad = ctx.createRadialGradient(W * 0.5, captionTop * 0.46, 40, W * 0.5, captionTop * 0.5, W * 0.78);
    bgGrad.addColorStop(0, glow);
    bgGrad.addColorStop(0.55, '#0b1226');
    bgGrad.addColorStop(1, '#050811');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const maxH = captionTop - 48;
    const dstH = Math.min(maxH, Math.round(artImg.naturalHeight * (W - 80) / artImg.naturalWidth));
    const dstW = Math.round(dstH * (artImg.naturalWidth / artImg.naturalHeight));
    const dstX = Math.round((W - dstW) / 2);
    const dstY = Math.round((captionTop - dstH) / 2) + 6;
    ctx.drawImage(artImg, dstX, dstY, dstW, dstH);

    if (rec.frame || (rec.streak || 0) >= 7) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 227, 171, 0.9)';
      ctx.lineWidth = 6;
      ctx.strokeRect(dstX - 14, dstY - 14, dstW + 28, dstH + 28);
      ctx.strokeStyle = 'rgba(250, 227, 171, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(dstX - 22, dstY - 22, dstW + 44, dstH + 44);
      ctx.fillStyle = '#fae3ab';
      ctx.font = '600 18px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('七日纪念框', W / 2, dstY - 28);
      ctx.restore();
    }

    ctx.fillStyle = '#070b17';
    ctx.fillRect(21, captionTop, W - 42, H - captionTop - 21);
    ctx.strokeStyle = 'rgba(230, 190, 106, 0.34)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(44, captionTop);
    ctx.lineTo(W - 44, captionTop);
    ctx.stroke();

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f5f7fc';
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans JP", sans-serif';
    const nameLine = `${rec.jpName} / ${rec.name}  ·  ${rec.outfit}`;
    ctx.fillText(nameLine, 48, captionTop + 44);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fae3ab';
    ctx.font = 'bold 24px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    ctx.fillText(rec.id, W - 48, captionTop + 44);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#d5c49a';
    ctx.font = '600 18px -apple-system, "PingFang SC", sans-serif';
    const extras = [`第 ${rec.streak || 1} 日`];
    if (rec.stamps) extras.push(`传递 ${rec.stamps}`);
    ctx.fillText(extras.join('  ·  '), 48, captionTop + 78);

    ctx.fillStyle = '#8b9bb5';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif';
    ctx.fillText('umamusumedb.com  ·  非官方同人预览（免费展示，非官方周边）  ·  Artwork © Cygames, Inc.', 48, captionTop + 112);
    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('empty'))), 'image/png');
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  const copyBtn = document.getElementById('copyLinkBtn');
  const dlBtn = document.getElementById('downloadPngBtn');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = shareUrl();
      const prev = copyBtn.textContent;
      const ok = () => {
        copyBtn.textContent = '✓ 已复制分享链接';
        setTimeout(() => { copyBtn.textContent = prev; }, 2000);
      };
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        ok();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(ok).catch(fallback);
      } else fallback();
    });
  }

  if (dlBtn) {
    dlBtn.addEventListener('click', async () => {
      if (dlBtn.disabled) return;
      const prev = dlBtn.textContent;
      dlBtn.disabled = true;
      dlBtn.textContent = '生成纪念图中…';
      try {
        const img = await loadImage(`/holo/cards/${record.cardId}/card.webp`);
        const canvas = renderCaptionedPoster(img, record);
        const blob = await canvasToBlob(canvas);
        downloadBlob(blob, `${record.id}_${record.cardId}.png`);
        dlBtn.textContent = '已保存';
        setTimeout(() => { dlBtn.textContent = prev; dlBtn.disabled = false; }, 1600);
      } catch (e) {
        dlBtn.textContent = '保存失败，请重试';
        setTimeout(() => { dlBtn.textContent = prev; dlBtn.disabled = false; }, 2000);
      }
    });
  }

  window.__HOLO_RENDER_POSTER__ = renderCaptionedPoster;
})();
