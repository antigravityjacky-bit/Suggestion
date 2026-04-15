// Summary Table — generates the bottom summary section with all 4 badges

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

  // Build all-badges HTML
  function allBadgesHTML() {
    return `<div class="summary-badges">${
      BADGE_CLASSES.map((cls, i) =>
        `<span class="badge ${cls}">${BADGE_LABELS[i]}</span>`
      ).join('')
    }</div>`;
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

  // Build header: race col + 4 horse cols
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
      td.innerHTML = `
        <div class="summary-horse-inner">
          <span class="summary-horse-num">${h ?? '—'}</span>
          ${h ? allBadgesHTML() : ''}
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
