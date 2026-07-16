/* ============================================================
   SHARE
   Renders the result as a shareable PNG using Canvas only —
   no external image libraries. Sized for IG/Discord/WhatsApp/X.
   ============================================================ */

import { state } from '../core/state.js';
import { formatINR } from '../core/scoring.js';

const W = 1080;
const H = 1350;

export async function buildShareCanvas() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* noop */ }
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const r = state.result;

  // Background
  ctx.fillStyle = '#0a0a0b';
  ctx.fillRect(0, 0, W, H);

  // Ambient gold glow accents
  const grad1 = ctx.createRadialGradient(W * 0.18, H * 0.12, 0, W * 0.18, H * 0.12, 520);
  grad1.addColorStop(0, 'rgba(201,169,97,0.10)');
  grad1.addColorStop(1, 'rgba(201,169,97,0)');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, H);

  // Card panel
  const pad = 64;
  const cardX = pad, cardY = pad, cardW = W - pad * 2, cardH = H - pad * 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fillStyle = '#141416';
  ctx.fill();
  ctx.strokeStyle = '#242428';
  ctx.lineWidth = 1;
  ctx.stroke();

  roundRect(ctx, cardX + 18, cardY + 18, cardW - 36, cardH - 36, 24);
  ctx.strokeStyle = 'rgba(201,169,97,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  let y = cardY + 110;
  const cx = W / 2;

  // Seal
  drawSeal(ctx, cx, y, 78);
  y += 130;

  // Eyebrow
  ctx.fillStyle = '#c9a961';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('BUREAU OF MATRIMONIAL EVALUATION', cx, y);
  y += 34;

  ctx.fillStyle = '#57575c';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText(`CERT ID: ${r.certId}`, cx, y);
  y += 70;

  // Name
  ctx.fillStyle = '#8a8a8e';
  ctx.font = '500 26px "Inter", sans-serif';
  ctx.fillText(`Certificate issued to ${r.name}`, cx, y);
  y += 70;

  // Amount label
  ctx.fillStyle = '#8a8a8e';
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText('OFFICIAL FICTIONAL MARKET VALUE', cx, y);
  y += 90;

  // Amount
  ctx.fillStyle = '#ddc484';
  ctx.font = '700 92px "JetBrains Mono", monospace';
  ctx.fillText(formatINR(r.amount), cx, y);
  y += 76;

  // Badge pill
  ctx.font = '600 24px "Inter", sans-serif';
  const badgeText = r.badge;
  const badgeWidth = ctx.measureText(badgeText).width + 64;
  roundRect(ctx, cx - badgeWidth / 2, y - 34, badgeWidth, 56, 28);
  ctx.fillStyle = 'rgba(201,169,97,0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,169,97,0.35)';
  ctx.stroke();
  ctx.fillStyle = '#ddc484';
  ctx.fillText(badgeText, cx, y + 4);
  y += 100;

  // Roast (wrapped, italic-ish via font)
  ctx.fillStyle = '#f5f5f7';
  ctx.font = 'italic 500 32px "Fraunces", serif';
  y = wrapText(ctx, `"${r.roast}"`, cx, y, cardW - 180, 42);
  y += 50;

  // Rank + date footer
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#57575c';
  const footerY = cardY + cardH - 70;
  ctx.textAlign = 'left';
  ctx.fillText(`RANK: ${r.rank.toUpperCase()}`, cardX + 60, footerY);
  ctx.textAlign = 'right';
  ctx.fillText(`ISSUED ${r.issuedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, cardX + cardW - 60, footerY);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3a3a3e';
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.fillText('FOR ENTERTAINMENT PURPOSES ONLY', cx, cardY + cardH - 24);

  return canvas;
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = '#c9a961';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#8a7442';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
  ctx.stroke();

  // star glyph
  ctx.fillStyle = '#c9a961';
  ctx.beginPath();
  const spikes = 5, outerR = r * 0.34, innerR = r * 0.15;
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.moveTo(0, -outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  ctx.textAlign = 'center';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}

export async function downloadShareImage() {
  const canvas = await buildShareCanvas();
  const link = document.createElement('a');
  link.download = `bureau-certificate-${state.result.certId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function shareResult() {
  const canvas = await buildShareCanvas();

  canvas.toBlob(async (blob) => {
    if (!blob) return downloadShareImage();
    const file = new File([blob], `bureau-certificate-${state.result.certId}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Bureau of Matrimonial Evaluation',
          text: `My official fictional market value: ${formatINR(state.result.amount)}`,
        });
        return;
      } catch (e) {
        // user cancelled or share failed — fall through to download
      }
    }
    downloadShareImage();
  }, 'image/png');
}
