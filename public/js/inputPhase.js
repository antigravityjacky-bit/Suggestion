// Input Phase — renders the race data entry form

import { createSession, saveRaces } from './api.js';

export function renderInputPhase(container, onComplete) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'input-phase-container';

  wrapper.innerHTML = `
    <p class="phase-title">SYSTEM INIT</p>
    <h1 class="phase-heading">輸入今日賽馬資料</h1>

    <div class="race-count-section">
      <label for="race-count-input">今日共有多少場比賽？</label>
      <input type="number" id="race-count-input" min="1" max="20" value="1" />
      <button class="btn btn-outline" id="set-races-btn">確認場數</button>
    </div>

    <form id="races-form" class="hidden">
      <div id="races-form-list" class="races-form-list"></div>
      <button type="submit" class="btn btn-primary" style="width:100%;">
        生成分析表
      </button>
    </form>
  `;

  container.appendChild(wrapper);

  const countInput = wrapper.querySelector('#race-count-input');
  const setBtn = wrapper.querySelector('#set-races-btn');
  const form = wrapper.querySelector('#races-form');
  const listEl = wrapper.querySelector('#races-form-list');

  setBtn.addEventListener('click', () => {
    const count = parseInt(countInput.value, 10);
    if (!count || count < 1 || count > 20) {
      countInput.classList.add('input-error');
      return;
    }
    countInput.classList.remove('input-error');
    countInput.disabled = true;
    setBtn.disabled = true;
    buildRaceForms(listEl, count);
    form.classList.remove('hidden');
  });

  countInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setBtn.click();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const count = parseInt(countInput.value, 10);

    let valid = true;
    const races = [];

    for (let i = 1; i <= count; i++) {
      const xiaomei = [];
      const mingye = [];
      let mingjia = null;

      // Collect xiaomei inputs
      for (let k = 1; k <= 4; k++) {
        const el = wrapper.querySelector(`#xm-${i}-${k}`);
        const val = parseInt(el.value, 10);
        if (!val || val < 1 || val > 99) {
          el.classList.add('input-error');
          valid = false;
        } else {
          el.classList.remove('input-error');
          xiaomei.push(val);
        }
      }

      // Collect mingye inputs
      for (let k = 1; k <= 4; k++) {
        const el = wrapper.querySelector(`#my-${i}-${k}`);
        const val = parseInt(el.value, 10);
        if (!val || val < 1 || val > 99) {
          el.classList.add('input-error');
          valid = false;
        } else {
          el.classList.remove('input-error');
          mingye.push(val);
        }
      }

      // Collect mingjia input
      const mjEl = wrapper.querySelector(`#mj-${i}`);
      const mjVal = parseInt(mjEl.value, 10);
      if (!mjVal || mjVal < 1 || mjVal > 99) {
        mjEl.classList.add('input-error');
        valid = false;
      } else {
        mjEl.classList.remove('input-error');
        mingjia = mjVal;
      }

      races.push({ race_number: i, xiaomei, mingye, mingjia });
    }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> 儲存中...';

    try {
      const today = new Date().toISOString().slice(0, 10);
      const { session_id } = await createSession(count, today);
      const { race_ids } = await saveRaces(session_id, races);

      // Attach db IDs to races array
      races.forEach((r, idx) => { r.id = race_ids[idx]; });

      onComplete({ id: session_id, race_count: count, label: today, races });
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = '生成分析表';
      showToast('儲存失敗，請重試');
    }
  });
}

function buildRaceForms(container, count) {
  container.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const card = document.createElement('div');
    card.className = 'race-form-card';
    card.innerHTML = `
      <div class="race-form-header">第 ${i} 場 RACE ${i}</div>

      <div class="predictor-row">
        <div class="predictor-label">
          <strong>小妹</strong>
          4 個馬號
        </div>
        <div class="predictor-inputs">
          <input type="number" id="xm-${i}-1" min="1" max="99" placeholder="馬" />
          <input type="number" id="xm-${i}-2" min="1" max="99" placeholder="馬" />
          <input type="number" id="xm-${i}-3" min="1" max="99" placeholder="馬" />
          <input type="number" id="xm-${i}-4" min="1" max="99" placeholder="馬" />
        </div>
      </div>

      <div class="predictor-row">
        <div class="predictor-label">
          <strong>明冶</strong>
          4 個馬號
        </div>
        <div class="predictor-inputs">
          <input type="number" id="my-${i}-1" min="1" max="99" placeholder="馬" />
          <input type="number" id="my-${i}-2" min="1" max="99" placeholder="馬" />
          <input type="number" id="my-${i}-3" min="1" max="99" placeholder="馬" />
          <input type="number" id="my-${i}-4" min="1" max="99" placeholder="馬" />
        </div>
      </div>

      <div class="predictor-row">
        <div class="predictor-label">
          <strong>名家</strong>
          1 個馬號
        </div>
        <div class="predictor-inputs">
          <input type="number" id="mj-${i}" min="1" max="99" placeholder="馬" />
        </div>
      </div>
    `;
    container.appendChild(card);

    // Auto-tab between inputs within this card
    const inputs = card.querySelectorAll('input');
    inputs.forEach((inp, idx) => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          if (e.key === 'Enter') e.preventDefault();
          if (idx < inputs.length - 1) inputs[idx + 1].focus();
        }
      });
    });
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 300); }, 2500);
}
