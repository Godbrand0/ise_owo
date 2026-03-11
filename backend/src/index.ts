import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import insightsRouter from './routes/insights.js';
import { syncBlockchainData } from './services/sync.js';
import { updateLeaderboard } from './services/scoring.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Trigger sync manually
app.post('/api/sync', async (req, res) => {
    try {
        await syncBlockchainData();
        await updateLeaderboard();
        res.json({ message: 'Sync complete' });
    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// AI Insights Routes
app.use('/api', insightsRouter);

app.listen(port, () => {
    console.log(`Taskify Backend listening at http://localhost:${port}`);
    
    // Optional: Initial sync on startup
    if (process.env.INITIAL_SYNC === 'true') {
        syncBlockchainData().then(() => updateLeaderboard());
    }
});
