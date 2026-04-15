import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sessionsRouter from './routes/sessions.js';
import racesRouter from './routes/races.js';
import horsestatRouter from './routes/horsestat.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/sessions', sessionsRouter);
app.use('/api/races', racesRouter);
app.use('/api/horsestat', horsestatRouter);

app.listen(PORT, () => {
  console.log(`Horse Racing Tracker running at http://localhost:${PORT}`);
});
