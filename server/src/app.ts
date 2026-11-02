import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import contactRoutes from './routes/contactRoutes';
import leadRoutes from './routes/leadRoutes';
import activityRoutes from './routes/activityRoutes';
import statsRoutes from './routes/statsRoutes';
import searchRoutes from './routes/searchRoutes';

const app = express();

// CLIENT_ORIGIN can be a comma-separated list; unset means any origin (local dev).
const origins = process.env.CLIENT_ORIGIN?.split(',').map((s) => s.trim());

app.use(helmet());
app.use(cors(origins ? { origin: origins } : undefined));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(express.json({ limit: '100kb' }));

app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
