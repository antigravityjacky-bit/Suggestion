// Click Cycle — handles badge cycling on horse number cells

import { updateClickState } from './api.js';
import { renderBadge } from './tableRenderer.js';

// BADGE CYCLE: 0 (none) → 1 (1st) → 2 (2nd) → 3 (3rd) → 4 (4th) → 0
const CYCLE_LENGTH = 5; // 0,1,2,3,4

export function attachClickCycle(tableEl) {
  tableEl.addEventListener('click', handleCellClick);
}

function handleCellClick(e) {
  const cell = e.target.closest('.horse-cell');
  if (!cell) return;
  if (cell.dataset.na === 'true') return; // NA cells are not clickable

  const raceId    = Number(cell.dataset.raceId);
  const slotIndex = Number(cell.dataset.slotIndex);
  const current   = Number(cell.dataset.clickCount) || 0;
  const next      = (current + 1) % CYCLE_LENGTH;

  // Update DOM
  cell.dataset.clickCount = next;
  const numEl = cell.querySelector('.horse-num');
  const horse  = numEl.textContent;

  // Replace cell content
  cell.innerHTML = `<span class="horse-num">${horse}</span>${renderBadge(next)}`;

  // Persist to DB (fire-and-forget)
  updateClickState(raceId, slotIndex, next).catch(console.error);
}
