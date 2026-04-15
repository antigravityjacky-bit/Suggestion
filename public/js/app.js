// Main app controller — state machine and phase orchestration

import { getSessions, getSession } from './api.js';
import { renderInputPhase }    from './inputPhase.js';
import { renderRaceTable }     from './tableRenderer.js';
import { attachClickCycle }    from './clickCycle.js';
import { handleHorsestatToggle } from './horsestat.js';
import { renderSummaryTable }  from './summaryTable.js';

// App state
let appState = {
  session: null,
  races: [],
};

// DOM refs
const inputPhaseEl  = document.getElementById('input-phase');
const tablePhaseEl  = document.getElementById('table-phase');
const summaryEl     = document.getElementById('summary-phase');
const summaryBar    = document.getElementById('summary-bar');
const summaryBtn    = document.getElementById('summary-btn');
const sessionSelect = document.getElementById('session-select');
const newSessionBtn = document.getElementById('new-session-btn');

// ============================================================
// Boot
// ============================================================
async function init() {
  await loadSessionList();
  showInputPhase();
}

// ============================================================
// Session list (header dropdown)
// ============================================================
async function loadSessionList() {
  try {
    const sessions = await getSessions();
    sessionSelect.innerHTML = '<option value="">— 載入歷史記錄 —</option>';
    for (const s of sessions) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.label || '無標題'} (${s.race_count}場)`;
      sessionSelect.appendChild(opt);
    }
  } catch (e) {
    console.error('Failed to load sessions', e);
  }
}

sessionSelect.addEventListener('change', async () => {
  const id = sessionSelect.value;
  if (!id) return;
  try {
    sessionSelect.disabled = true;
    const session = await getSession(id);
    sessionSelect.disabled = false;
    transitionToTable(session);
  } catch (err) {
    sessionSelect.disabled = false;
    console.error(err);
    showToast('載入失敗，請重試');
  }
});

newSessionBtn.addEventListener('click', () => {
  sessionSelect.value = '';
  showInputPhase();
});

// ============================================================
// Phase transitions
// ============================================================
function showInputPhase() {
  tablePhaseEl.classList.add('hidden');
  summaryEl.classList.add('hidden');
  summaryBar.classList.add('hidden');
  inputPhaseEl.classList.remove('hidden');

  renderInputPhase(inputPhaseEl, (session) => {
    // Refresh session dropdown after new session
    loadSessionList();
    transitionToTable(session);
  });
}

function transitionToTable(session) {
  appState.session = session;
  appState.races   = session.races;

  inputPhaseEl.classList.add('hidden');
  summaryEl.classList.add('hidden');
  tablePhaseEl.classList.remove('hidden');
  summaryBar.classList.remove('hidden');

  renderRaceTable(tablePhaseEl, session, appState, handleHorsestatToggle);

  // Attach click cycle to the rendered table
  const table = document.getElementById('main-race-table');
  if (table) attachClickCycle(table);
}

// ============================================================
// Summary button
// ============================================================
summaryBtn.addEventListener('click', () => {
  summaryEl.classList.remove('hidden');
  renderSummaryTable(summaryEl, appState.races);
  summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ============================================================
// Toast helper
// ============================================================
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, 2500);
}

// ============================================================
// Start
// ============================================================
init();
