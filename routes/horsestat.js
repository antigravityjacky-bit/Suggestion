import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// POST /api/horsestat — upsert horsestat for a race
router.post('/', (req, res) => {
  const { race_id, horses } = req.body;
  if (!race_id || !Array.isArray(horses) || horses.length !== 4) {
    return res.status(400).json({ error: 'race_id and horses[4] required' });
  }
  db.prepare(`
    INSERT INTO horsestat (race_id, horse_1, horse_2, horse_3, horse_4)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(race_id) DO UPDATE SET
      horse_1 = excluded.horse_1,
      horse_2 = excluded.horse_2,
      horse_3 = excluded.horse_3,
      horse_4 = excluded.horse_4
  `).run(race_id, horses[0] ?? null, horses[1] ?? null, horses[2] ?? null, horses[3] ?? null);
  res.json({ ok: true });
});

// GET /api/horsestat/:race_id
router.get('/:race_id', (req, res) => {
  const row = db.prepare('SELECT * FROM horsestat WHERE race_id = ?').get(req.params.race_id);
  res.json(row || null);
});

export default router;
