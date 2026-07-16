/* ============================================================
   BREAKDOWN SCREEN
   Category progress bars + a hand-rolled canvas donut chart
   showing composition of the total score. No chart libraries.
   ============================================================ */

import { state } from '../core/state.js';
import { sound } from '../audio.js';

let onBack = null;
let onShare = null;

export function initBreakdown({ onBackCallback, onShareCallback }) {
  onBack = onBackCallback;
  onShare = onShareCallback;
}

export function renderBreakdown() {
  const r = state.result;
  const root = document.getElementById('screen-breakdown');

  root.innerHTML = `
    <div class="breakdown-inner">
      <div class="breakdown-header fade-up">
        <div class="eyebrow">Full Evaluation Breakdown</div>
        <h2>How the Bureau reached its number</h2>
      </div>

      <div class="breakdown-chart-row fade-up-1">
        <canvas id="breakdown-donut" width="220" height="220"></canvas>
      </div>

      <div class="breakdown-list" id="breakdown-list"></div>

      <div class="breakdown-actions fade-up-3">
        <button class="btn btn-secondary" id="btn-breakdown-back">← Back to Certificate</button>
        <button class="btn btn-primary" id="btn-breakdown-share">Share Result</button>
      </div>
    </div>
  `;

  const list = document.getElementById('breakdown-list');
  list.innerHTML = r.categoryBreakdown.map((cat, i) => `
    <div class="breakdown-row fade-up-${Math.min(4, 1 + Math.floor(i / 2))}">
      <div class="breakdown-row-top">
        <span class="label">${cat.label}</span>
        <span class="value mono">${cat.percent}%</span>
      </div>
      <div class="breakdown-bar-track">
        <div class="breakdown-bar-fill" data-target="${cat.percent}"></div>
      </div>
    </div>
  `).join('');

  // animate bars in
  window.setTimeout(() => {
    list.querySelectorAll('.breakdown-bar-fill').forEach((el) => {
      el.style.width = `${el.dataset.target}%`;
    });
  }, 200);

  drawDonut(r.categoryBreakdown);

  document.getElementById('btn-breakdown-back').addEventListener('click', () => {
    sound.click();
    if (onBack) onBack();
  });
  document.getElementById('btn-breakdown-share').addEventListener('click', () => {
    sound.click();
    if (onShare) onShare();
  });
}

function drawDonut(categories) {
  const canvas = document.getElementById('breakdown-donut');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 220;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const radius = 84;
  const lineWidth = 26;

  const total = categories.reduce((s, c) => s + Math.max(c.raw, 0), 0) || 1;
  let startAngle = -Math.PI / 2;

  // base track
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  const goldBase = [201, 169, 97];
  categories.forEach((cat, i) => {
    const value = Math.max(cat.raw, 0);
    const angle = (value / total) * Math.PI * 2;
    const lightness = 1 - i * (0.6 / Math.max(1, categories.length - 1));
    const [r, g, b] = goldBase.map((c) => Math.round(c * (0.45 + 0.55 * lightness)));

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = categories.length === 1 ? 'round' : 'butt';
    ctx.stroke();

    startAngle += angle;
  });

  // center label
  ctx.fillStyle = '#f5f5f7';
  ctx.font = '600 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${state.result.normalized}`, cx, cy - 6);
  ctx.fillStyle = '#8a8a8e';
  ctx.font = '500 10px "Inter", sans-serif';
  ctx.fillText('COMPOSITE SCORE', cx, cy + 18);
}
