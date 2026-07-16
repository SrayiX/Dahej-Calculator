/* ============================================================
   STATE
   Single source of truth for the running session. One-shot:
   nothing here is persisted to storage.
   ============================================================ */

export const state = {
  currentScreen: 'landing',
  stepIndex: 0,
  answers: {},
  result: null,
  muted: false,
};

export function setAnswer(id, value) {
  state.answers[id] = value;
}

export function getAnswer(id) {
  return state.answers[id];
}

export function resetSession() {
  state.stepIndex = 0;
  state.answers = {};
  state.result = null;
}
