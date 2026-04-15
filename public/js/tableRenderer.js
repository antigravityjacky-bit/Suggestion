// Table Renderer — derives slots and builds the main race table

// Slot 5: first of 明冶's numbers that doesn't appear in 小妹's numbers
export function deriveSlot5(xiaomeiNums, mingyeNums) {
  const set = new Set(xiaomeiNums);
  for (const n of mingyeNums) {
    if (!set.has(n)) return n;
  }
  return 'NA';
}

// Slot 6: 名家's number, or NA if it duplicates any of slots 1-5
export function deriveSlot6(slots1to5, mingjiaNum) {
  const taken = new Set(slots1to5.filter(v => v !== 'NA'));
  return taken.has(mingjiaNum) ? 'NA' : mingjiaNum;
}

// Build the 6-slot array for a race
export function buildSlots(race) {
  const xiaomei = [race.xiaomei_1, race.xiaomei_2, race.xiaomei_3, race.xiaomei_4];
  const mingye  = [race.mingye_1,  race.mingye_2,  race.mingye_3,  race.mingye_4];
  const slot5   = deriveSlot5(xiaomei, mingye);
  const slot6   = deriveSlot6([...xiaomei, slot5], race.mingjia_1);
  return [...xiaomei, slot5, slot6];
}

// Render click count as a badge element (or nothing)
export function renderBadge(clickCount) {
  if (!clickCount || clickCount === 0) return '';
  const labels = ['', '1st', '2nd', '3rd', '4th'];
  const classes = ['', 'badge-1st', 'badge-2nd', 'badge-3rd', 'badge-4th'];
  return `<span class="badge ${classes[clickCount]}">${labels[clickCount]}</span>`;
}

// Build the full race table and append to container
export function renderRaceTable(container, session, appState, onHorsestatToggle) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'table-phase-container';

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'table-header-row';
  headerRow.innerHTML = `
    <div>
      <p class="phase-title">ANALYSIS TABLE</p>
      <h2 class="phase-heading" style="margin-bottom:0">${session.label || '今日賽事'} 分析表</h2>
    </div>
    <div class="session-info">SESSION #${session.id} &nbsp;|&nbsp; ${session.race_count} 場比賽</div>
  `;
  wrapper.appendChild(headerRow);

  // Table wrapper
  const tableWrap = document.createElement('div');
  tableWrap.className = 'race-table-wrapper';

  const table = document.createElement('table');
  table.className = 'race-table';
  table.id = 'main-race-table';

  // thead
  table.innerHTML = `
    <thead>
      <tr>
        <th>場次</th>
        <th colspan="4" style="border-right:1px solid var(--border-bright)">
          小妹預測
        </th>
        <th style="border-right:1px solid var(--border-bright)">明冶補充</th>
        <th>名家貼士</th>
        <th>HORSESTAT</th>
      </tr>
      <tr style="font-size:9px; color:var(--text-muted)">
        <th></th>
        <th>#1</th><th>#2</th><th>#3</th>
        <th style="border-right:1px solid var(--border-bright)">#4</th>
        <th style="border-right:1px solid var(--border-bright)">#5</th>
        <th>#6</th>
        <th></th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  for (const race of session.races) {
    const slots = buildSlots(race);

    // Get saved click states
    const clickMap = {};
    if (race.click_states) {
      for (const cs of race.click_states) {
        clickMap[cs.slot_index] = cs.click_count;
      }
    }

    const tr = document.createElement('tr');
    tr.dataset.raceId = race.id;

    // Race number cell
    const raceTd = document.createElement('td');
    raceTd.className = 'race-num-cell';
    raceTd.textContent = `第${race.race_number}場`;
    tr.appendChild(raceTd);

    // 6 horse slot cells
    for (let si = 0; si < 6; si++) {
      const val = slots[si];
      const isNA = val === 'NA';
      const clickCount = clickMap[si] || 0;

      const td = document.createElement('td');
      td.className = 'horse-cell' + (isNA ? ' na-cell' : '');
      td.dataset.raceId = race.id;
      td.dataset.slotIndex = si;
      td.dataset.clickCount = clickCount;
      if (isNA) td.dataset.na = 'true';

      // Add right border after slot 3 and slot 4
      if (si === 3 || si === 4) {
        td.style.borderRight = '1px solid var(--border-bright)';
      }

      td.innerHTML = `<span class="horse-num">${val}</span>${renderBadge(clickCount)}`;
      tr.appendChild(td);
    }

    // Horsestat button cell
    const hsTd = document.createElement('td');
    hsTd.className = 'horsestat-btn-cell';

    const hsBtn = document.createElement('button');
    hsBtn.className = 'btn-horsestat' + (race.horsestat ? ' active' : '');
    hsBtn.dataset.raceId = race.id;
    hsBtn.dataset.raceNumber = race.race_number;
    hsBtn.innerHTML = `&#9670; Horsestat`;

    hsBtn.addEventListener('click', () => onHorsestatToggle(race, hsBtn, tbody));
    hsTd.appendChild(hsBtn);
    tr.appendChild(hsTd);

    tbody.appendChild(tr);

    // If horsestat already exists, render its copy block beneath
    if (race.horsestat) {
      const horses = [
        race.horsestat.horse_1,
        race.horsestat.horse_2,
        race.horsestat.horse_3,
        race.horsestat.horse_4,
      ].filter(Boolean);
      appendHorsestatRow(tbody, tr, race.race_number, horses, true);
    }
  }

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  wrapper.appendChild(tableWrap);
  container.appendChild(wrapper);
}

// Insert (or replace) the horsestat expansion row after a race row
export function appendHorsestatRow(tbody, raceRow, raceNumber, horses, readOnly = false) {
  // Remove existing expansion row if present
  const existing = tbody.querySelector(`.horsestat-expansion[data-race-num="${raceNumber}"]`);
  if (existing) existing.remove();

  const expansionTr = document.createElement('tr');
  expansionTr.className = 'horsestat-expansion';
  expansionTr.dataset.raceNum = raceNumber;

  const td = document.createElement('td');
  td.colSpan = 8;

  const inner = document.createElement('div');
  inner.className = 'horsestat-inner';

  const copyText = `第${raceNumber}場Horsestat推介 : ${horses.join(' ')}`;

  inner.innerHTML = `
    <div class="horsestat-copy-block">
      <span class="horsestat-copy-text">${copyText}</span>
      <button class="btn-copy" data-copy="${copyText}">&#128203; 複製</button>
    </div>
  `;

  td.appendChild(inner);
  expansionTr.appendChild(td);

  // Insert after the race row
  raceRow.insertAdjacentElement('afterend', expansionTr);

  // Wire up copy button
  const copyBtn = expansionTr.querySelector('.btn-copy');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(copyText).then(() => {
      copyBtn.textContent = '✓ 已複製';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = '&#128203; 複製';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  return expansionTr;
}
