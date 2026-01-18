// @ts-ignore
import express from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import helmet from 'helmet';
// @ts-ignore
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import contactRoutes from './routes/contactRoutes';
import leadRoutes from './routes/leadRoutes';
import activityRoutes from './routes/activityRoutes';
import statsRoutes from './routes/statsRoutes';
import searchRoutes from './routes/searchRoutes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;