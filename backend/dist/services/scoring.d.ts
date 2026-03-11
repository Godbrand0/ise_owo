export interface UserMetrics {
    address: string;
    tasks_created: number;
    tasks_completed: number;
    total_stx_funded: number;
    total_usdcx_funded: number;
    avg_tip_percent: number;
}
/**
 * Deterministic Scoring Engine
 * Formula:
 * - STX/USDCx Funded: 10 points per full token unit
 * - Tasks Created: 50 points each
 * - Avg Tip: 100 points per % point
 */
export declare function calculateScore(metrics: UserMetrics): number;
export declare function updateLeaderboard(): Promise<void>;
