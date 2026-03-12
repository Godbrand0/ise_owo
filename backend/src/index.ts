import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import insightsRouter from './routes/insights.js';
import { syncBlockchainData } from './services/sync.js';
import { updateLeaderboard } from './services/scoring.js';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN ?? false
        : true,
    credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manually trigger a blockchain sync + leaderboard refresh
app.post('/api/sync', async (_req, res) => {
    try {
        await syncBlockchainData();
        await updateLeaderboard();
        res.json({ message: 'Sync complete' });
    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

app.use('/api', insightsRouter);

app.listen(port, () => {
    console.log(`Taskify Backend listening at http://localhost:${port}`);

    // Refresh leaderboard scores every 5 minutes
    setInterval(() => {
        syncBlockchainData()
            .then(() => updateLeaderboard())
            .catch((err: unknown) => console.error('Periodic sync error:', err));
    }, 5 * 60 * 1000);
});
