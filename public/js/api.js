// localStorage-based database — same exported interface as the Express API version.
// Works on Netlify (static hosting) with no backend required.
// Data persists in the browser between sessions.

const META_KEY     = 'racing_meta';
const SESSIONS_KEY = 'racing_sessions';

// ── Internal helpers ─────────────────────────────────────────

function getMeta() {
  return JSON.parse(localStorage.getItem(META_KEY) || '{"nextSessionId":1,"nextRaceId":1}');
}
function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function getAllSessions() {
  return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
}
function saveAllSessions(arr) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(arr));
}

function getSessionData(id) {
  return JSON.parse(localStorage.getItem(`racing_session_${id}`) || 'null');
}
function saveSessionData(id, data) {
  localStorage.setItem(`racing_session_${id}`, JSON.stringify(data));
}

// ── Public API (mirrors Express endpoints) ───────────────────

export async function getSessions() {
  return getAllSessions();
}

export async function createSession(race_count, label) {
  const meta = getMeta();
  const id   = meta.nextSessionId++;
  saveMeta(meta);

  const session = {
    id,
    race_count,
    label: label || null,
    created_at: new Date().toISOString(),
  };

  const sessions = getAllSessions();
  sessions.unshift(session);
  saveAllSessions(sessions);

  saveSessionData(id, { ...session, races: [] });
  return { session_id: id };
}

export async function getSession(id) {
  const data = getSessionData(Number(id));
  if (!data) throw new Error(`Session ${id} not found`);
  return data;
}

export async function saveRaces(session_id, races) {
  const meta = getMeta();
  const sessionData = getSessionData(session_id);

  const race_ids = [];
  const savedRaces = races.map((r) => {
    const raceId = meta.nextRaceId++;
    race_ids.push(raceId);
    return {
      id:          raceId,
      session_id,
      race_number: r.race_number,
      xiaomei_1:   r.xiaomei[0] ?? null,
      xiaomei_2:   r.xiaomei[1] ?? null,
      xiaomei_3:   r.xiaomei[2] ?? null,
      xiaomei_4:   r.xiaomei[3] ?? null,
      mingye_1:    r.mingye[0]  ?? null,
      mingye_2:    r.mingye[1]  ?? null,
      mingye_3:    r.mingye[2]  ?? null,
      mingye_4:    r.mingye[3]  ?? null,
      mingjia_1:   r.mingjia    ?? null,
      click_states: [],
      horsestat:   null,
    };
  });

  saveMeta(meta);
  sessionData.races = savedRaces;
  saveSessionData(session_id, sessionData);

  return { race_ids };
}

export async function updateClickState(race_id, slot_index, click_count) {
  // Find the session that owns this race by scanning sessions
  const sessions = getAllSessions();
  for (const s of sessions) {
    const data = getSessionData(s.id);
    if (!data) continue;
    const race = data.races.find(r => r.id === race_id);
    if (!race) continue;

    const existing = race.click_states.find(cs => cs.slot_index === slot_index);
    if (existing) {
      existing.click_count = click_count;
    } else {
      race.click_states.push({ slot_index, click_count });
    }
    saveSessionData(s.id, data);
    break;
  }
  return { ok: true };
}

export async function saveHorsestat(race_id, horses) {
  const sessions = getAllSessions();
  for (const s of sessions) {
    const data = getSessionData(s.id);
    if (!data) continue;
    const race = data.races.find(r => r.id === race_id);
    if (!race) continue;

    race.horsestat = {
      horse_1: horses[0] ?? null,
      horse_2: horses[1] ?? null,
      horse_3: horses[2] ?? null,
      horse_4: horses[3] ?? null,
    };
    saveSessionData(s.id, data);
    break;
  }
  return { ok: true };
}
