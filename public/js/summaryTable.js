// Summary Table — generates the bottom summary section with all 4 badges
// or a red ✕ if the horse number was never clicked in the main table.

import { buildSlots } from './tableRenderer.js';

export function renderSummaryTable(container, races) {
  container.innerHTML = '';

  // Filter races that have horsestat data
  const racesWithHS = races.filter(r => r.horsestat);

  if (racesWithHS.length === 0) {
    container.innerHTML = `
      <p class="phase-title">SUMMARY</p>
      <p style="color:var(--text-muted);font-size:14px;padding:20px 0;">
        尚未輸入任何場次的 Horsestat 推介資料。
      </p>
    `;
    return;
  }

  const BADGE_CLASSES = ['badge-1st', 'badge-2nd', 'badge-3rd', 'badge-4th'];
  const BADGE_LABELS  = ['1st', '2nd', '3rd', '4th'];

  // Returns click_count (0 = not clicked, 1–4 = specific badge) for horse h in this race
  function getClickCount(race, h) {
    if (h == null) return 0;
    const slots = buildSlots(race);             // [xm1,xm2,xm3,xm4,slot5,slot6]
    const slotIndex = slots.findIndex(v => v === h);
    if (slotIndex === -1) return 0;             // not in table at all
    if (!race.click_states) return 0;
    const cs = race.click_states.find(c => c.slot_index === slotIndex);
    return cs ? cs.click_count : 0;
  }

  const section = document.createElement('div');

  section.innerHTML = `
    <p class="summary-title">HORSESTAT SUMMARY</p>
    <h2 class="summary-heading">Horsestat 推介總結</h2>
  `;

  const tableWrap = document.createElement('div');
  tableWrap.className = 'race-table-wrapper';

  const table = document.createElement('table');
  table.className = 'summary-table';

  table.innerHTML = `
    <thead>
      <tr>
        <th>場次</th>
        <th>推介 #1</th>
        <th>推介 #2</th>
        <th>推介 #3</th>
        <th>推介 #4</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  for (const race of racesWithHS) {
    const hs = race.horsestat;
    const horses = [hs.horse_1, hs.horse_2, hs.horse_3, hs.horse_4];

    const tr = document.createElement('tr');

    const raceTd = document.createElement('td');
    raceTd.className = 'summary-race-cell';
    raceTd.textContent = `第${race.race_number}場`;
    tr.appendChild(raceTd);

    for (const h of horses) {
      const td = document.createElement('td');
      td.className = 'summary-horse-cell';

      const clickCount = getClickCount(race, h);
      let badgeHTML = '';
      if (h) {
        if (clickCount > 0) {
          // Show only the one badge that was actually assigned
          const cls   = BADGE_CLASSES[clickCount - 1];
          const label = BADGE_LABELS[clickCount - 1];
          badgeHTML = `<div class="summary-badges"><span class="badge ${cls}">${label}</span></div>`;
        } else {
          badgeHTML = '<span class="badge-x">✕</span>';
        }
      }

      td.innerHTML = `
        <div class="summary-horse-inner">
          <span class="summary-horse-num">${h ?? '—'}</span>
          ${badgeHTML}
        </div>
      `;
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  section.appendChild(tableWrap);
  container.appendChild(section);
}
