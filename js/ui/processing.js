/* ============================================================
   PROCESSING SCREEN
   Builds anticipation before the reveal. ~8-12s total runtime.
   ============================================================ */

import { PROCESSING_MESSAGES } from '../data/content.js';
import { sealSVG } from './seal.js';

let onFinished = null;

export function initProcessing({ onFinishedCallback }) {
  onFinished = onFinishedCallback;
  const root = document.getElementById('screen-processing');
  root.innerHTML = `
    <div class="processing-inner">
      <div class="seal processing-seal">${sealSVG('proc')}</div>
      <div class="processing-percent mono" id="proc-percent">0%</div>
      <div class="processing-track">
        <div class="progress-track"><div class="progress-fill" id="proc-fill"></div></div>
      </div>
      <div class="processing-message" id="proc-message"></div>
    </div>
  `;
}

export function runProcessing() {
  const percentEl = document.getElementById('proc-percent');
  const fillEl = document.getElementById('proc-fill');
  const msgEl = document.getElementById('proc-message');

  const totalDuration = 9200 + Math.random() * 2200; // 9.2s - 11.4s
  const stepCount = PROCESSING_MESSAGES.length;
  const stepDuration = totalDuration / stepCount;

  let currentStep = 0;
  let currentPercent = 0;

  showMessage(msgEl, PROCESSING_MESSAGES[0]);

  const percentTimer = setInterval(() => {
    // ease toward the target for the current step, never quite linear
    const target = Math.min(100, Math.round(((currentStep + 1) / stepCount) * 100));
    if (currentPercent < target) {
      currentPercent += 1;
      percentEl.textContent = `${currentPercent}%`;
      fillEl.style.width = `${currentPercent}%`;
    }
  }, Math.max(18, totalDuration / 100 / 2));

  const stepTimer = setInterval(() => {
    currentStep += 1;
    if (currentStep >= stepCount) {
      clearInterval(stepTimer);
      window.setTimeout(() => {
        clearInterval(percentTimer);
        currentPercent = 100;
        percentEl.textContent = '100%';
        fillEl.style.width = '100%';
        window.setTimeout(() => {
          if (typeof onFinished === 'function') onFinished();
        }, 650);
      }, 300);
      return;
    }
    showMessage(msgEl, PROCESSING_MESSAGES[currentStep]);
  }, stepDuration);
}

function showMessage(el, text) {
  el.innerHTML = `<span class="msg-fade">${text}</span>`;
}
