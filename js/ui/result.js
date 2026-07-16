/* ============================================================
   RESULT SCREEN
   ============================================================ */

import { state } from '../core/state.js';
import { sealSVG } from './seal.js';
import { sound } from '../audio.js';
import { formatINR } from '../core/scoring.js';

let onViewBreakdown = null;
let onRestart = null;
let onShare = null;

export function initResult({ onViewBreakdownCallback, onRestartCallback, onShareCallback }) {
  onViewBreakdown = onViewBreakdownCallback;
  onRestart = onRestartCallback;
  onShare = onShareCallback;
}

export function renderResult() {
  const r = state.result;
  const root = document.getElementById('screen-result');

  root.innerHTML = `
    <div class="result-inner">
      <div class="result-cert">
        <div class="result-seal-wrap">
          <div class="stamp-flash" id="stamp-flash"></div>
          <div class="seal seal-stamp" id="result-seal">${sealSVG('result')}</div>
        </div>

        <div class="pill result-cert-id reveal-item" id="reveal-certid">
          <span class="pill-dot"></span>
          <span class="mono">CERT ID: ${r.certId}</span>
        </div>

        <p class="result-name reveal-item" id="reveal-name">Certificate issued to <strong style="color:var(--text-primary)">${escapeHtml(r.name)}</strong></p>

        <div class="reveal-item" id="reveal-amount-block">
          <div class="eyebrow result-amount-label">Official Fictional Market Value</div>
          <div class="result-amount mono counting" id="result-amount">₹0</div>
        </div>

        <div class="result-badge reveal-item" id="reveal-badge">
          <span class="pill">${r.badge}</span>
        </div>

        <p class="result-roast reveal-item" id="reveal-roast">"${escapeHtml(r.roast)}"</p>

        <div class="result-confidence reveal-item" id="reveal-confidence">
          <span class="result-confidence-label">Confidence Level</span>
          <div class="result-confidence-track">
            <div class="result-confidence-fill" id="confidence-fill"></div>
          </div>
          <span class="result-confidence-value mono" id="confidence-value">0%</span>
        </div>

        <div class="result-divider reveal-item" id="reveal-divider"></div>

        <div class="result-stamp-footer reveal-item" id="reveal-footer">
          <span>RANK: ${r.rank.toUpperCase()}</span>
          <span>ISSUED ${formatDate(r.issuedAt)}</span>
        </div>
      </div>

      <div class="result-actions reveal-item" id="reveal-actions">
        <button class="btn btn-primary" id="btn-view-breakdown">View Full Breakdown</button>
        <button class="btn btn-secondary" id="btn-share-result">Share Result</button>
        <button class="btn btn-ghost" id="btn-restart">Start Over</button>
      </div>

      <p class="result-fine-print reveal-item" id="reveal-fineprint">
        This assessment is satirical and for entertainment only. No real financial, marital, or personal evaluation has taken place.
      </p>
    </div>
  `;

  runRevealSequence(r);

  document.getElementById('btn-view-breakdown').addEventListener('click', () => {
    sound.click();
    if (onViewBreakdown) onViewBreakdown();
  });
  document.getElementById('btn-share-result').addEventListener('click', () => {
    sound.click();
    if (onShare) onShare();
  });
  document.getElementById('btn-restart').addEventListener('click', () => {
    sound.click();
    if (onRestart) onRestart();
  });
}

function runRevealSequence(r) {
  const seal = document.getElementById('result-seal');
  const flash = document.getElementById('stamp-flash');

  window.setTimeout(() => {
    seal.classList.add('stamped');
    flash.classList.add('flash');
    sound.stamp();
  }, 150);

  const sequence = [
    'reveal-certid', 'reveal-name', 'reveal-amount-block', 'reveal-badge',
    'reveal-roast', 'reveal-confidence', 'reveal-divider', 'reveal-footer',
    'reveal-actions', 'reveal-fineprint',
  ];

  sequence.forEach((id, i) => {
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('revealed');
    }, 550 + i * 140);
  });

  // Count up the amount once its block is revealed
  window.setTimeout(() => {
    animateCountUp(r.amount);
    sound.reveal();
  }, 550 + 2 * 140);

  // Confidence meter fill
  window.setTimeout(() => {
    const fill = document.getElementById('confidence-fill');
    const val = document.getElementById('confidence-value');
    fill.style.width = `${r.confidence * 4}%`; // visually exaggerate the sliver
    animateNumber(val, 0, r.confidence, 900, (n) => `${n}%`);
  }, 550 + 5 * 140);
}

function animateCountUp(target) {
  const el = document.getElementById('result-amount');
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = Math.round(target * eased);
    el.textContent = formatINR(current);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = formatINR(target);
      el.classList.remove('counting');
    }
  }
  requestAnimationFrame(frame);
}

function animateNumber(el, from, to, duration, formatter) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const current = Math.round(from + (to - from) * t);
    el.textContent = formatter(current);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
