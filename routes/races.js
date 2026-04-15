import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// POST /api/races — bulk insert races for a session
router.post('/', (req, res) => {
  const { session_id, races } = req.body;
  if (!session_id || !Array.isArray(races) || races.length === 0) {
    return res.status(400).json({ error: 'session_id and races[] required' });
  }

  const insertRace = db.prepare(`
    INSERT INTO races
      (session_id, race_number, xiaomei_1, xiaomei_2, xiaomei_3, xiaomei_4,
       mingye_1, mingye_2, mingye_3, mingye_4, mingjia_1)
    VALUES
      (@session_id, @race_number, @xiaomei_1, @xiaomei_2, @xiaomei_3, @xiaomei_4,
       @mingye_1, @mingye_2, @mingye_3, @mingye_4, @mingjia_1)
  `);

  const insertMany = db.transaction((racesArr) => {
    const ids = [];
    for (const r of racesArr) {
      const result = insertRace.run({
        session_id,
        race_number: r.race_number,
        xiaomei_1: r.xiaomei[0] ?? null,
        xiaomei_2: r.xiaomei[1] ?? null,
        xiaomei_3: r.xiaomei[2] ?? null,
        xiaomei_4: r.xiaomei[3] ?? null,
        mingye_1:  r.mingye[0]  ?? null,
        mingye_2:  r.mingye[1]  ?? null,
        mingye_3:  r.mingye[2]  ?? null,
        mingye_4:  r.mingye[3]  ?? null,
        mingjia_1: r.mingjia    ?? null,
      });
      ids.push(result.lastInsertRowid);
    }
    return ids;
  });

  const race_ids = insertMany(races);
  res.json({ race_ids });
});

// PUT /api/click/:race_id/:slot_index — upsert click state
router.put('/click/:race_id/:slot_index', (req, res) => {
  const { race_id, slot_index } = req.params;
  const { click_count } = req.body;
  db.prepare(`
    INSERT INTO click_states (race_id, slot_index, click_count)
    VALUES (?, ?, ?)
    ON CONFLICT(race_id, slot_index) DO UPDATE SET click_count = excluded.click_count
  `).run(Number(race_id), Number(slot_index), Number(click_count));
  res.json({ ok: true });
});

export default router;
