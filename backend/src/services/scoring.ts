import { supabase } from '../db.js';

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
    const stxPoints = Math.floor((Number(metrics.total_stx_funded) / 1e6) * 10);
    const usdcxPoints = Math.floor((Number(metrics.total_usdcx_funded) / 1e6) * 10);
    const creationPoints = metrics.tasks_created * 50;
    const tipPoints = Math.floor(metrics.avg_tip_percent * 100);

    return stxPoints + usdcxPoints + creationPoints + tipPoints;
}

export async function updateLeaderboard(): Promise<void> {
    // Fetch all users to calculate scores
    const { data: users, error } = await supabase
        .from('users')
        .select('address, tasks_created, tasks_completed, total_stx_funded, total_usdcx_funded, avg_tip_percent');

    if (error) throw error;
    if (!users) return;

    const updates = users.map(user => ({
        address: user.address,
        current_score: calculateScore(user as unknown as UserMetrics),
        last_updated: new Date().toISOString()
    }));

    // Batch upsert to update scores
    const { error: updateError } = await supabase
        .from('users')
        .upsert(updates, { onConflict: 'address' });

    if (updateError) throw updateError;
}

