// Horsestat — per-race Horsestat input and copy block

import { saveHorsestat } from './api.js';
import { appendHorsestatRow } from './tableRenderer.js';

// Track which races currently have the form open
const openForms = new Set();

export function handleHorsestatToggle(race, btnEl, tbody) {
  const raceNum = race.race_number;
  const raceId  = race.id;

  // If an expansion row already exists and horsestat is saved, just toggle
  const existing = tbody.querySelector(`.horsestat-expansion[data-race-num="${raceNum}"]`);

  if (existing) {
    // If form is open, close it; if copy block is showing, toggle close
    existing.remove();
    btnEl.classList.remove('active');
    openForms.delete(raceNum);
    return;
  }

  // No expansion row — open the input form
  openForms.add(raceNum);
  btnEl.classList.add('active');

  // Find the race row
  const raceRow = tbody.querySelector(`tr[data-race-id="${raceId}"]`);
  if (!raceRow) return;

  // Build expansion row with form
  const expansionTr = document.createElement('tr');
  expansionTr.className = 'horsestat-expansion';
  expansionTr.dataset.raceNum = raceNum;

  const td = document.createElement('td');
  td.colSpan = 8;

  const inner = document.createElement('div');
  inner.className = 'horsestat-inner';
  inner.innerHTML = `
    <div class="horsestat-form">
      <label>第 ${raceNum} 場 Horsestat 推介馬號：</label>
      <div class="horsestat-inputs">
        <input type="number" class="hs-input" min="1" max="99" placeholder="馬" />
        <input type="number" class="hs-input" min="1" max="99" placeholder="馬" />
        <input type="number" class="hs-input" min="1" max="99" placeholder="馬" />
        <input type="number" class="hs-input" min="1" max="99" placeholder="馬" />
      </div>
      <button class="btn btn-outline hs-submit-btn" style="padding:7px 16px;font-size:12px;">確認</button>
      <button class="btn btn-ghost hs-cancel-btn" style="padding:7px 12px;font-size:12px;">取消</button>
    </div>
  `;

  td.appendChild(inner);
  expansionTr.appendChild(td);
  raceRow.insertAdjacentElement('afterend', expansionTr);

  // Auto-tab between inputs
  const inputs = inner.querySelectorAll('.hs-input');
  inputs.forEach((inp, idx) => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (idx < inputs.length - 1) inputs[idx + 1].focus();
        else inner.querySelector('.hs-submit-btn').click();
      }
    });
  });
  inputs[0].focus();

  // Cancel
  inner.querySelector('.hs-cancel-btn').addEventListener('click', () => {
    expansionTr.remove();
    btnEl.classList.remove('active');
    openForms.delete(raceNum);
  });

  // Submit
  inner.querySelector('.hs-submit-btn').addEventListener('click', async () => {
    const vals = [];
    let valid = true;

    inputs.forEach((inp) => {
      const v = parseInt(inp.value, 10);
      if (!v || v < 1 || v > 99) {
        inp.classList.add('input-error');
        valid = false;
      } else {
        inp.classList.remove('input-error');
        vals.push(v);
      }
    });

    if (!valid) return;

    try {
      await saveHorsestat(raceId, vals);
      // Replace form with copy block
      expansionTr.remove();
      // Re-render the expansion with copy view
      appendHorsestatRow(tbody, raceRow, raceNum, vals, true);
      btnEl.classList.add('active');
      // Update race object so summary table can find it
      race.horsestat = { horse_1: vals[0], horse_2: vals[1], horse_3: vals[2], horse_4: vals[3] };
    } catch (err) {
      console.error(err);
      showToast('儲存失敗，請重試');
    }
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 300); }, 2500);
}
