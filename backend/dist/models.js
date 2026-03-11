import pool from './db.js';
export async function upsertUser(address, username) {
    return pool.query('INSERT INTO users (address, username) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET username = $2', [address, username]);
}
export async function updateUserDetails(address, details) {
    const fields = Object.keys(details).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(details);
    return pool.query(`UPDATE users SET ${fields}, last_updated = NOW() WHERE address = $1`, [address, ...values]);
}
export async function getLeaderboard(limit = 10) {
    const res = await pool.query('SELECT address, username, current_score, tasks_completed FROM users ORDER BY current_score DESC LIMIT $1', [limit]);
    return res.rows;
}
//# sourceMappingURL=models.js.map