import pool from './db.js';

export async function upsertUser(address: string, username: string) {
    return pool.query(
        'INSERT INTO users (address, username) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET username = $2',
        [address, username]
    );
}

type UserDetails = {
    tasks_created?: number;
    tasks_completed?: number;
    total_stx_funded?: number;
    total_usdcx_funded?: number;
    avg_tip_percent?: number;
};

const ALLOWED_COLUMNS: ReadonlySet<keyof UserDetails> = new Set([
    'tasks_created',
    'tasks_completed',
    'total_stx_funded',
    'total_usdcx_funded',
    'avg_tip_percent',
]);

export async function updateUserDetails(address: string, details: UserDetails) {
    const entries = (Object.entries(details) as [keyof UserDetails, number | undefined][])
        .filter(([key, val]) => ALLOWED_COLUMNS.has(key) && val !== undefined);
    if (entries.length === 0) return;

    const fields = entries.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const values = entries.map(([, val]) => val);
    return pool.query(
        `UPDATE users SET ${fields}, last_updated = NOW() WHERE address = $1`,
        [address, ...values]
    );
}

export async function getLeaderboard(limit = 10) {
    const res = await pool.query(
        'SELECT address, username, current_score, tasks_completed FROM users ORDER BY current_score DESC LIMIT $1',
        [limit]
    );
    return res.rows;
}
