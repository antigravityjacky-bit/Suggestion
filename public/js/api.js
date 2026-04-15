// API fetch wrappers for all backend endpoints

async function apiFetch(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getSessions() {
  return apiFetch('GET', '/api/sessions');
}

export async function createSession(race_count, label) {
  return apiFetch('POST', '/api/sessions', { race_count, label });
}

export async function getSession(id) {
  return apiFetch('GET', `/api/sessions/${id}`);
}

export async function saveRaces(session_id, races) {
  return apiFetch('POST', '/api/races', { session_id, races });
}

export async function updateClickState(race_id, slot_index, click_count) {
  // Fire-and-forget safe — returns promise but callers may ignore it
  return apiFetch('PUT', `/api/races/click/${race_id}/${slot_index}`, { click_count });
}

export async function saveHorsestat(race_id, horses) {
  return apiFetch('POST', '/api/horsestat', { race_id, horses });
}
