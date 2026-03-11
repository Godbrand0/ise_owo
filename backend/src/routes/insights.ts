import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import pool from '../db.js';

const router = express.Router();
const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const ADDRESS_RE = /^S[A-Z0-9]{30,50}$/;

// Helper for caching
async function getCachedInsight(key: string): Promise<string | null> {
    const res = await pool.query(
        'SELECT insight FROM insights_cache WHERE cache_key = $1 AND expires_at > NOW()',
        [key]
    );
    return res.rows[0]?.insight ?? null;
}

async function cacheInsight(key: string, insight: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month TTL
    await pool.query(
        'INSERT INTO insights_cache (cache_key, insight, expires_at) VALUES ($1, $2, $3) ON CONFLICT (cache_key) DO UPDATE SET insight = $2, expires_at = $3',
        [key, insight, expiresAt]
    );
}

// Real DB fetchers

const fetchMonthlyDataFromDB = async (month: string) => {
    // Tasks created this month from tasks_metadata
    const tasksRes = await pool.query(
        `SELECT COUNT(*) AS tasks_created FROM tasks_metadata WHERE TO_CHAR(created_at, 'YYYY-MM') = $1`,
        [month]
    );

    // Aggregate platform-wide user stats
    const statsRes = await pool.query(`
        SELECT
            COALESCE(SUM(tasks_completed), 0)      AS tasks_completed,
            COALESCE(SUM(total_stx_funded), 0)     AS total_stx_funded,
            COALESCE(SUM(total_usdcx_funded), 0)   AS total_usdcx_funded,
            COUNT(*)                                AS unique_creators
        FROM users
    `);

    const topRes = await pool.query(
        'SELECT username FROM users ORDER BY current_score DESC LIMIT 1'
    );

    const stats = statsRes.rows[0];
    return {
        tasksCreated: parseInt(tasksRes.rows[0].tasks_created),
        tasksCompleted: parseInt(stats.tasks_completed),
        totalStxFunded: parseInt(stats.total_stx_funded),
        totalUsdcxFunded: parseInt(stats.total_usdcx_funded),
        uniqueCreators: parseInt(stats.unique_creators),
        uniqueContributors: 0, // tracked on-chain; not yet mirrored off-chain
        topCreator: { username: topRes.rows[0]?.username ?? 'N/A' },
        momGrowth: 0, // requires historical snapshots — not yet implemented
    };
};

const fetchCreatorDataFromDB = async (address: string, _month: string) => {
    const userRes = await pool.query('SELECT * FROM users WHERE address = $1', [address]);
    if (!userRes.rows.length) throw new Error(`User not found: ${address}`);
    const user = userRes.rows[0];

    // Rank: number of users with a higher score + 1
    const rankRes = await pool.query(
        'SELECT COUNT(*) + 1 AS rank FROM users WHERE current_score > $1',
        [user.current_score]
    );
    const totalRes = await pool.query('SELECT COUNT(*) AS total FROM users');

    // Score gap to the user directly above
    const aboveRes = await pool.query(
        'SELECT current_score FROM users WHERE current_score > $1 ORDER BY current_score ASC LIMIT 1',
        [user.current_score]
    );
    const scoreGap = aboveRes.rows.length
        ? aboveRes.rows[0].current_score - user.current_score
        : 0;

    return {
        username: user.username as string,
        tasksCreated: user.tasks_created as number,
        tasksCompleted: user.tasks_completed as number,
        totalStx: user.total_stx_funded as number,
        totalUsdcx: user.total_usdcx_funded as number,
        avgTipPercent: parseFloat(user.avg_tip_percent),
        rank: parseInt(rankRes.rows[0].rank),
        totalCreators: parseInt(totalRes.rows[0].total),
        prevRank: 0, // requires historical snapshots — not yet implemented
        scoreGap,
    };
};

const fetchPlatformAverages = async (_month: string) => {
    const res = await pool.query(`
        SELECT
            COALESCE(AVG(tasks_created), 0)    AS avg_tasks,
            COALESCE(AVG(avg_tip_percent), 0)  AS avg_tip
        FROM users
    `);
    return {
        avgTasks: parseFloat(res.rows[0].avg_tasks),
        avgTip: parseFloat(res.rows[0].avg_tip),
    };
};

// General monthly insights
router.get('/insights/general/:month', async (req: express.Request, res: express.Response) => {
    try {
        const { month } = req.params;
        if (!MONTH_RE.test(month)) {
            res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
            return;
        }

        const cached = await getCachedInsight(`general:${month}`);
        if (cached) { res.json({ insight: cached }); return; }

        const monthData = await fetchMonthlyDataFromDB(month);

        const message = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: `You are Taskify's analytics narrator. Generate concise,
                     engaging monthly summaries for the Taskify bounty board
                     on Stacks (Bitcoin L2). Use specific numbers.
                     3-4 paragraphs max. Do not make up data.`,
            messages: [{
                role: 'user',
                content: `Generate the monthly platform summary for ${month}.

Data:
- Tasks created: ${monthData.tasksCreated}
- Tasks completed: ${monthData.tasksCompleted}
- Total STX funded: ${monthData.totalStxFunded / 1e6} STX
- Total USDCx funded: ${monthData.totalUsdcxFunded / 1e6} USDCx
- Unique creators: ${monthData.uniqueCreators}
- Unique contributors: ${monthData.uniqueContributors}
- Top creator: ${monthData.topCreator.username}
- Month-over-month growth: ${monthData.momGrowth}%`,
            }],
        });

        const insightText = (message.content[0] as { text: string }).text;
        await cacheInsight(`general:${month}`, insightText);
        res.json({ insight: insightText });
    } catch (error) {
        console.error('Insights error (general):', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

// Personal creator insights
router.get('/insights/personal/:address/:month', async (req: express.Request, res: express.Response) => {
    try {
        const { address, month } = req.params;

        if (!ADDRESS_RE.test(address)) {
            res.status(400).json({ error: 'Invalid Stacks address.' });
            return;
        }
        if (!MONTH_RE.test(month)) {
            res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
            return;
        }

        const cached = await getCachedInsight(`personal:${address}:${month}`);
        if (cached) { res.json({ insight: cached }); return; }

        const creatorData = await fetchCreatorDataFromDB(address, month);
        const platformAvg = await fetchPlatformAverages(month);

        const message = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: `You are Taskify's personal analytics assistant. Generate
                     personalized monthly insights for bounty creators on Stacks.
                     Be specific with numbers. Give 1-2 actionable tips.
                     2-3 paragraphs. Tone: personal coach, not corporate report.`,
            messages: [{
                role: 'user',
                content: `Generate personal insights for creator "${creatorData.username}".

Their metrics for ${month}:
- Tasks created: ${creatorData.tasksCreated}
- Tasks completed: ${creatorData.tasksCompleted}
- Funded: ${creatorData.totalStx / 1e6} STX + ${creatorData.totalUsdcx / 1e6} USDCx
- Avg tip: ${creatorData.avgTipPercent}%
- Leaderboard rank: #${creatorData.rank} of ${creatorData.totalCreators}
- Previous month rank: #${creatorData.prevRank}
- Score gap to next rank: ${creatorData.scoreGap} points

Platform averages:
- Avg tasks/creator: ${platformAvg.avgTasks}
- Avg tip: ${platformAvg.avgTip}%`,
            }],
        });

        const insightText = (message.content[0] as { text: string }).text;
        await cacheInsight(`personal:${address}:${month}`, insightText);
        res.json({ insight: insightText });
    } catch (error) {
        console.error('Insights error (personal):', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

export default router;
