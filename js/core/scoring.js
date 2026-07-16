/* ============================================================
   SCORING ENGINE
   Pure functions only — no DOM access. Takes the questions bank
   + collected answers, returns a fully computed result object.
   Add a question in questions.js and it is automatically
   included here via its declared `category` + score/options.
   ============================================================ */

import { QUESTIONS, CATEGORY_LABELS } from '../data/questions.js';
import { pickRoast, pickFromLadder, RANKS, BADGES } from '../data/content.js';

const MAX_POSSIBLE = computeMaxPossible();

function computeMaxPossible() {
  let max = 0;
  for (const q of QUESTIONS) {
    if (!q.category) continue;
    if (q.type === 'single' || q.type === 'dropdown') {
      max += Math.max(...q.options.map((o) => o.score));
    } else if (q.type === 'multiple') {
      max += q.options.filter((o) => o.score > 0).reduce((s, o) => s + o.score, 0);
    } else if (q.type === 'slider' || q.type === 'number') {
      max += q.score(q.max);
    }
  }
  return max;
}

/**
 * @param {Record<string, any>} answers - question id -> raw value
 * @returns {object} full result payload for result + breakdown screens
 */
export function computeResult(answers) {
  const byCategory = {};
  let rawTotal = 0;

  for (const q of QUESTIONS) {
    if (!q.category) continue;
    const value = answers[q.id];
    const points = scoreQuestion(q, value);
    byCategory[q.category] = (byCategory[q.category] || 0) + points;
    rawTotal += points;
  }

  const normalized = clamp((rawTotal / MAX_POSSIBLE) * 100, 1, 100);

  // Category breakdown normalized to 0-100 for bar display
  const categoryBreakdown = Object.entries(byCategory).map(([key, val]) => {
    const catMax = maxForCategory(key);
    return {
      key,
      label: CATEGORY_LABELS[key] || key,
      raw: Math.round(val),
      percent: clamp(Math.round((val / catMax) * 100), 0, 100),
    };
  }).sort((a, b) => b.percent - a.percent);

  const amount = computeAmount(normalized);
  const certId = generateCertId();
  const seedIndex = certId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);

  return {
    name: (answers.name || '').trim() || 'Applicant',
    normalized: Math.round(normalized),
    amount,
    amountFormatted: formatINR(amount),
    rank: pickFromLadder(RANKS, normalized),
    badge: pickFromLadder(BADGES, normalized),
    roast: pickRoast(normalized, seedIndex),
    confidence: computeConfidence(seedIndex),
    certId,
    categoryBreakdown,
    issuedAt: new Date(),
  };
}

function scoreQuestion(q, value) {
  if (value === undefined || value === null || value === '') return 0;

  switch (q.type) {
    case 'single':
    case 'dropdown': {
      const opt = q.options.find((o) => o.id === value);
      return opt ? opt.score : 0;
    }
    case 'multiple': {
      if (!Array.isArray(value) || value.length === 0) return 0;
      return value.reduce((sum, id) => {
        const opt = q.options.find((o) => o.id === id);
        return sum + (opt ? opt.score : 0);
      }, 0);
    }
    case 'slider':
    case 'number': {
      const num = Number(value);
      if (Number.isNaN(num)) return 0;
      return q.score(num);
    }
    default:
      return 0;
  }
}

function maxForCategory(categoryKey) {
  let max = 0;
  for (const q of QUESTIONS) {
    if (q.category !== categoryKey) continue;
    if (q.type === 'single' || q.type === 'dropdown') {
      max += Math.max(...q.options.map((o) => o.score));
    } else if (q.type === 'multiple') {
      max += q.options.filter((o) => o.score > 0).reduce((s, o) => s + o.score, 0);
    } else if (q.type === 'slider' || q.type === 'number') {
      max += q.score(q.max);
    }
  }
  return max || 1;
}

/* Amount curve: exponential so the top end feels dramatic while
   the low end still lands in a semi-plausible lakh range. */
function computeAmount(normalized) {
  const floor = 45000; // ₹45,000
  const ceiling = 250000000; // ₹25 crore
  const t = normalized / 100;
  const eased = Math.pow(t, 2.1);
  const raw = floor + eased * (ceiling - floor);
  // round to a "clean-ish" fictional figure
  const roundTo = raw > 10000000 ? 100000 : raw > 1000000 ? 10000 : 1000;
  return Math.round(raw / roundTo) * roundTo;
}

function computeConfidence(seedIndex) {
  // Intentionally low, per spec — 2% to 9%
  return 2 + (seedIndex % 8);
}

function generateCertId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'BME-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function formatINR(amount) {
  // Indian numbering: last 3 digits, then groups of 2
  const str = Math.round(amount).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const formatted = rest ? `${grouped},${lastThree}` : lastThree;
  return `₹${formatted}`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
