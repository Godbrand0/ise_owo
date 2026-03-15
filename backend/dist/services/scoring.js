import pool from '../db.js';
/**
 * Deterministic Scoring Engine
 * Formula:
 * - STX/USDCx Funded: 10 points per full token unit
 * - Tasks Created: 50 points each
 * - Avg Tip: 100 points per % point
 */
export function calculateScore(metrics) {
    const stxPoints = Math.floor((metrics.total_stx_funded / 1e6) * 10);
    const usdcxPoints = Math.floor((metrics.total_usdcx_funded / 1e6) * 10);
    const creationPoints = metrics.tasks_created * 50;
    const tipPoints = Math.floor(metrics.avg_tip_percent * 100);
    return stxPoints + usdcxPoints + creationPoints + tipPoints;
}
export async function updateLeaderboard() {
    await pool.query(`
        UPDATE users SET
            current_score = (
                FLOOR(total_stx_funded / 1000000.0 * 10) +
                FLOOR(total_usdcx_funded / 1000000.0 * 10) +
                tasks_created * 50 +
                FLOOR(avg_tip_percent * 100)
            )::INTEGER,
            last_updated = NOW()
    `);
}
//# sourceMappingURL=scoring.js.map