import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();
const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const ADDRESS_RE = /^S[A-Z0-9]{30,50}$/;

// Helper for caching
async function getCachedInsight(key: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('insights_cache')
        .select('insight')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single();
    
    if (error) return null;
    return data?.insight ?? null;
}

async function cacheInsight(key: string, insight: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month TTL
    
    await supabase.from('insights_cache').upsert({
        cache_key: key,
        insight,
        expires_at: expiresAt.toISOString()
    }, { onConflict: 'cache_key' });
}

// Real DB fetchers

const fetchMonthlyDataFromDB = async (month: string) => {
    // Tasks created this month from tasks_metadata
    // Note: This relies on simple filter. For complex date logic, we might need a custom RPC or view.
    const { count: tasksCreated } = await supabase
        .from('tasks_metadata')
        .select('*', { count: 'exact', head: true })
        .filter('created_at', 'gte', `${month}-01`)
        .filter('created_at', 'lt', `${parseInt(month.split('-')[1]) === 12 ? (parseInt(month.split('-')[0]) + 1) + '-01' : month.split('-')[0] + '-' + (parseInt(month.split('-')[1]) + 1).toString().padStart(2, '0')}-01`);

    // Aggregate platform-wide user stats
    const { data: users } = await supabase
        .from('users')
        .select('tasks_completed, total_stx_funded, total_usdcx_funded');

    const stats = (users || []).reduce((acc, user) => {
        acc.tasks_completed += user.tasks_completed || 0;
        acc.total_stx_funded += Number(user.total_stx_funded) || 0;
        acc.total_usdcx_funded += Number(user.total_usdcx_funded) || 0;
        return acc;
    }, { tasks_completed: 0, total_stx_funded: 0, total_usdcx_funded: 0 });

    const { data: topUser } = await supabase
        .from('users')
        .select('username')
        .order('current_score', { ascending: false })
        .limit(1)
        .single();

    return {
        tasksCreated: tasksCreated || 0,
        tasksCompleted: stats.tasks_completed,
        totalStxFunded: stats.total_stx_funded,
        totalUsdcxFunded: stats.total_usdcx_funded,
        uniqueCreators: users?.length || 0,
        uniqueContributors: 0, 
        topCreator: { username: topUser?.username ?? 'N/A' },
        momGrowth: 0,
    };
};

const fetchCreatorDataFromDB = async (address: string, _month: string) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('address', address)
        .single();

    if (error || !user) throw new Error(`User not found: ${address}`);

    // Rank: number of users with a higher score + 1
    const { count: higherCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('current_score', user.current_score);
    
    const { count: totalCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    // Score gap to the user directly above
    const { data: aboveUser } = await supabase
        .from('users')
        .select('current_score')
        .gt('current_score', user.current_score)
        .order('current_score', { ascending: true })
        .limit(1)
        .single();

    const scoreGap = aboveUser ? aboveUser.current_score - user.current_score : 0;

    return {
        username: user.username as string,
        tasksCreated: user.tasks_created as number,
        tasksCompleted: user.tasks_completed as number,
        totalStx: user.total_stx_funded as number,
        totalUsdcx: user.total_usdcx_funded as number,
        avgTipPercent: parseFloat(user.avg_tip_percent),
        rank: (higherCount || 0) + 1,
        totalCreators: totalCount || 0,
        prevRank: 0,
        scoreGap,
    };
};

const fetchPlatformAverages = async (_month: string) => {
    const { data: users } = await supabase
        .from('users')
        .select('tasks_created, avg_tip_percent');

    if (!users || users.length === 0) {
        return { avgTasks: 0, avgTip: 0 };
    }

    const total = users.reduce((acc, user) => {
        acc.avgTasks += user.tasks_created || 0;
        acc.avgTip += parseFloat(user.avg_tip_percent) || 0;
        return acc;
    }, { avgTasks: 0, avgTip: 0 });

    return {
        avgTasks: total.avgTasks / users.length,
        avgTip: total.avgTip / users.length,
    };
};

// General monthly insights
router.get('/insights/general/:month', async (req: express.Request, res: express.Response) => {
    try {
        const month = req.params.month as string;
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
        const address = req.params.address as string;
        const month = req.params.month as string;

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
