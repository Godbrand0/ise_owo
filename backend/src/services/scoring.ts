import pool from '../db.js';

export interface UserMetrics {
    address: string;
    tasks_created: number;
    tasks_completed: number;
    total_stx_funded: number; // in microstacks
    total_usdcx_funded: number; // in microusds
    avg_tip_percent: number;
}

/**
 * Deterministic Scoring Engine
 * Formula:
 * - STX/USDCx Funded: 10 points per full token unit
 * - Tasks Created: 50 points each
 * - Avg Tip: 100 points per % point
 */
export function calculateScore(metrics: UserMetrics): number {
    const stxPoints = Math.floor((metrics.total_stx_funded / 1e6) * 10);
    const usdcxPoints = Math.floor((metrics.total_usdcx_funded / 1e6) * 10);
    const creationPoints = metrics.tasks_created * 50;
    const tipPoints = Math.floor(metrics.avg_tip_percent * 100);

    return stxPoints + usdcxPoints + creationPoints + tipPoints;
}

export async function updateLeaderboard() {
    const users = await pool.query('SELECT * FROM users');
    
    for (const user of users.rows) {
        const score = calculateScore(user);
        await pool.query(
            'UPDATE users SET current_score = $1, last_updated = NOW() WHERE address = $2',
            [score, user.address]
        );
    }
}
