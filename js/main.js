/* ============================================================
   MAIN
   Wires state, router, and UI modules into the app flow:
   landing → wizard → processing → result → breakdown
   ============================================================ */

import { state, resetSession } from './core/state.js';
import { registerScreens, showScreen } from './core/router.js';
import { computeResult } from './core/scoring.js';
import { sealSVG } from './ui/seal.js';
import { initWizard, startWizard } from './ui/wizard.js';
import { initProcessing, runProcessing } from './ui/processing.js';
import { initResult, renderResult } from './ui/result.js';
import { initBreakdown, renderBreakdown } from './ui/breakdown.js';
import { shareResult, downloadShareImage } from './ui/share.js';
import { sound, toggleMute } from './audio.js';

function init() {
  // Seal emblems
  document.getElementById('nav-seal').innerHTML = sealSVG('nav');
  document.getElementById('hero-seal').innerHTML = sealSVG('hero');

  // Mute toggle
  const muteBtn = document.getElementById('mute-toggle');
  muteBtn.addEventListener('click', () => {
    const muted = toggleMute();
    document.getElementById('icon-sound-on').style.display = muted ? 'none' : 'block';
    document.getElementById('icon-sound-off').style.display = muted ? 'block' : 'none';
  });

  // Wizard
  initWizard({
    onCompleteCallback: () => {
      showScreen('processing');
      runProcessing();
    },
  });

  // Processing
  initProcessing({
    onFinishedCallback: () => {
      state.result = computeResult(state.answers);
      showScreen('result');
    },
  });

  // Result
  initResult({
    onViewBreakdownCallback: () => showScreen('breakdown'),
    onRestartCallback: () => {
      resetSession();
      showScreen('landing');
    },
    onShareCallback: () => shareResult(),
  });

  // Breakdown
  initBreakdown({
    onBackCallback: () => showScreen('result'),
    onShareCallback: () => shareResult(),
  });

  registerScreens({
    result: renderResult,
    breakdown: renderBreakdown,
  });

  // Landing CTA
  document.getElementById('btn-start-assessment').addEventListener('click', () => {
    sound.advance();
    resetSession();
    showScreen('wizard');
    startWizard();
  });
}

document.addEventListener('DOMContentLoaded', init);
