import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// GET /api/sessions — list all sessions
router.get('/', (req, res) => {
  const sessions = db.prepare(
    'SELECT id, label, race_count, created_at FROM sessions ORDER BY id DESC'
  ).all();
  res.json(sessions);
});

// POST /api/sessions — create new session
router.post('/', (req, res) => {
  const { race_count, label } = req.body;
  if (!race_count || race_count < 1) {
    return res.status(400).json({ error: 'race_count must be >= 1' });
  }
  const result = db.prepare(
    'INSERT INTO sessions (race_count, label) VALUES (?, ?)'
  ).run(race_count, label || null);
  res.json({ session_id: result.lastInsertRowid });
});

// GET /api/sessions/:id — full session with races, click_states, horsestat
router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const races = db.prepare('SELECT * FROM races WHERE session_id = ? ORDER BY race_number').all(session.id);

  for (const race of races) {
    race.click_states = db.prepare(
      'SELECT slot_index, click_count FROM click_states WHERE race_id = ? ORDER BY slot_index'
    ).all(race.id);

    race.horsestat = db.prepare(
      'SELECT horse_1, horse_2, horse_3, horse_4 FROM horsestat WHERE race_id = ?'
    ).get(race.id) || null;
  }

  res.json({ ...session, races });
});

export default router;
