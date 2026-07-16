/* ============================================================
   WIZARD
   Renders the current question based on its declared type,
   handles validation, navigation, and slide transitions.
   ============================================================ */

import { QUESTIONS } from '../data/questions.js';
import { state, setAnswer, getAnswer } from '../core/state.js';
import { sound } from '../audio.js';

let onComplete = null;

export function initWizard({ onCompleteCallback }) {
  onComplete = onCompleteCallback;
  buildStaticShell();
}

export function startWizard() {
  state.stepIndex = 0;
  renderStep();
}

function buildStaticShell() {
  const root = document.getElementById('screen-wizard');
  root.innerHTML = `
    <div class="wizard-header">
      <div class="wizard-progress-row">
        <span class="wizard-step-label mono" id="wizard-step-label">01 / ${QUESTIONS.length}</span>
        <div class="progress-track"><div class="progress-fill" id="wizard-progress-fill"></div></div>
      </div>
    </div>
    <div class="wizard-body">
      <div class="wizard-card" id="wizard-card"></div>
    </div>
    <div class="wizard-nav">
      <button class="btn btn-ghost" id="wizard-back">← Back</button>
      <button class="btn btn-primary" id="wizard-next">Continue →</button>
    </div>
  `;
  document.getElementById('wizard-back').addEventListener('click', goBack);
  document.getElementById('wizard-next').addEventListener('click', goNext);
}

function currentQuestion() {
  return QUESTIONS[state.stepIndex];
}

function renderStep() {
  const q = currentQuestion();
  const card = document.getElementById('wizard-card');
  const backBtn = document.getElementById('wizard-back');
  const nextBtn = document.getElementById('wizard-next');
  const stepLabel = document.getElementById('wizard-step-label');
  const progressFill = document.getElementById('wizard-progress-fill');

  stepLabel.textContent = `${String(state.stepIndex + 1).padStart(2, '0')} / ${QUESTIONS.length}`;
  progressFill.style.width = `${((state.stepIndex) / QUESTIONS.length) * 100}%`;
  backBtn.style.visibility = state.stepIndex === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = state.stepIndex === QUESTIONS.length - 1 ? 'See My Result →' : 'Continue →';

  card.classList.remove('q-slide-enter');
  card.innerHTML = renderQuestionBody(q);
  // force reflow to restart animation
  void card.offsetWidth;
  card.classList.add('q-slide-enter');

  attachHandlers(q);
  updateNextState(q);
}

function renderQuestionBody(q) {
  const category = q.category
    ? `<div class="eyebrow q-category">${labelForCategory(q)}</div>`
    : `<div class="eyebrow q-category">Applicant Details</div>`;

  let bodyHtml = '';
  switch (q.type) {
    case 'text':
      bodyHtml = `
        <div class="field">
          <input type="text" class="text-input" id="q-input" maxlength="${q.maxLength || 60}"
            placeholder="${q.placeholder || ''}" value="${escapeHtml(getAnswer(q.id) || '')}" autocomplete="off" />
        </div>`;
      break;
    case 'number':
      bodyHtml = `
        <div class="field">
          <input type="number" class="number-input" id="q-input" min="${q.min}" max="${q.max}"
            placeholder="${q.placeholder || ''}" value="${getAnswer(q.id) ?? ''}" />
        </div>`;
      break;
    case 'single':
    case 'multiple': {
      const selected = q.type === 'multiple' ? (getAnswer(q.id) || []) : [getAnswer(q.id)];
      bodyHtml = `
        <div class="choice-grid" id="q-choice-grid">
          ${q.options.map((o) => choiceCardHtml(o, selected.includes(o.id), q.type)).join('')}
        </div>`;
      break;
    }
    case 'dropdown': {
      const current = getAnswer(q.id) || '';
      bodyHtml = `
        <div class="field">
          <div class="select-wrap">
            <select class="select-input" id="q-input">
              <option value="" disabled ${current ? '' : 'selected'}>${q.placeholder || 'Select an option'}</option>
              ${q.options.map((o) => `<option value="${o.id}" ${current === o.id ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </div>
        </div>`;
      break;
    }
    case 'slider': {
      const val = getAnswer(q.id) ?? q.min;
      bodyHtml = `
        <div class="slider-wrap">
          <div class="slider-value mono" id="slider-value">${formatSliderValue(val, q)}</div>
          <input type="range" class="slider-input" id="q-input" min="${q.min}" max="${q.max}" step="${q.step}" value="${val}" />
          <div class="slider-labels">
            <span>${formatSliderValue(q.min, q)}</span>
            <span>${formatSliderValue(q.max, q)}</span>
          </div>
        </div>`;
      break;
    }
  }

  return `
    ${category}
    <h2 class="q-title">${q.title}</h2>
    ${q.hint ? `<p class="q-hint">${q.hint}</p>` : ''}
    <div class="q-body">${bodyHtml}</div>
  `;
}

function choiceCardHtml(option, isSelected, type) {
  const checkIcon = type === 'single'
    ? `<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="#14120b"/></svg>`
    : `<svg viewBox="0 0 12 12"><path d="M2 6.5L4.7 9L10 3" stroke="#14120b" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `
    <button class="choice-card type-${type} ${isSelected ? 'selected' : ''}" data-option="${option.id}" type="button">
      <span class="choice-check">${checkIcon}</span>
      <span>${option.label}</span>
    </button>`;
}

function attachHandlers(q) {
  if (q.type === 'text') {
    const input = document.getElementById('q-input');
    input.addEventListener('input', () => {
      setAnswer(q.id, input.value);
      updateNextState(q);
    });
    input.focus();
  } else if (q.type === 'number') {
    const input = document.getElementById('q-input');
    input.addEventListener('input', () => {
      setAnswer(q.id, input.value === '' ? '' : Number(input.value));
      updateNextState(q);
    });
  } else if (q.type === 'dropdown') {
    const input = document.getElementById('q-input');
    input.addEventListener('change', () => {
      setAnswer(q.id, input.value);
      sound.select();
      updateNextState(q);
    });
  } else if (q.type === 'single' || q.type === 'multiple') {
    const grid = document.getElementById('q-choice-grid');
    grid.querySelectorAll('.choice-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const optId = btn.dataset.option;
        if (q.type === 'single') {
          setAnswer(q.id, optId);
          grid.querySelectorAll('.choice-card').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
        } else {
          const current = new Set(getAnswer(q.id) || []);
          if (current.has(optId)) current.delete(optId); else current.add(optId);
          setAnswer(q.id, Array.from(current));
          btn.classList.toggle('selected');
        }
        sound.select();
        updateNextState(q);
      });
    });
  } else if (q.type === 'slider') {
    const input = document.getElementById('q-input');
    const valueLabel = document.getElementById('slider-value');
    if (getAnswer(q.id) === undefined) setAnswer(q.id, Number(input.value));
    input.addEventListener('input', () => {
      const val = Number(input.value);
      setAnswer(q.id, val);
      valueLabel.textContent = formatSliderValue(val, q);
    });
  }
}

function updateNextState(q) {
  const nextBtn = document.getElementById('wizard-next');
  nextBtn.disabled = !isValid(q);
}

function isValid(q) {
  const val = getAnswer(q.id);
  switch (q.type) {
    case 'text':
      return typeof val === 'string' && val.trim().length > 0;
    case 'number':
      return val !== '' && val !== undefined && !Number.isNaN(Number(val)) && Number(val) >= q.min && Number(val) <= q.max;
    case 'single':
    case 'dropdown':
      return !!val;
    case 'multiple':
      return true; // optional — zero selections is a valid (scored 0) answer
    case 'slider':
      return true;
    default:
      return true;
  }
}

function goNext() {
  const q = currentQuestion();
  if (!isValid(q)) return;
  sound.advance();
  if (state.stepIndex === QUESTIONS.length - 1) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }
  state.stepIndex += 1;
  renderStep();
}

function goBack() {
  if (state.stepIndex === 0) return;
  sound.back();
  state.stepIndex -= 1;
  renderStep();
}

function labelForCategory(q) {
  const map = {
    income: 'Financial Standing',
    profession: 'Professional Record',
    vehicles: 'Vehicle Registry',
    skills: 'Skills & Credentials',
    assets: 'Asset Declaration',
    habits: 'Lifestyle Habits',
    investments: 'Investment Portfolio',
    lifestyle: 'Personal Profile',
  };
  return map[q.category] || 'Applicant Details';
}

function formatSliderValue(val, q) {
  if (q.id === 'income') {
    const rupees = Number(val) * 1000;
    return rupees >= 100000
      ? `₹${(rupees / 100000).toFixed(1)} L / mo`
      : `₹${rupees.toLocaleString('en-IN')} / mo`;
  }
  return `${val} ${q.unit || ''}`.trim();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
