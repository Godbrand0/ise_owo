import { Router } from 'express';
import pool from '../db.js';
const router = Router();
/**
 * @route POST /api/users
 * @desc Upsert user metadata (github, role)
 */
router.post('/users', async (req, res) => {
    const { address, username, github_username, role } = req.body;
    if (!address || !username) {
        return res.status(400).json({ error: 'Missing required fields: address, username' });
    }
    try {
        const query = `
            INSERT INTO users (address, username, github_username, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (address) DO UPDATE SET
                username = EXCLUDED.username,
                github_username = COALESCE(EXCLUDED.github_username, users.github_username),
                role = COALESCE(EXCLUDED.role, users.role),
                last_updated = NOW()
            RETURNING *;
        `;
        const result = await pool.query(query, [address, username, github_username, role]);
        res.json({ message: 'User updated successfully', user: result.rows[0] });
    }
    catch (error) {
        console.error('Error upserting user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
/**
 * @route GET /api/users/:address
 * @desc Get user metadata
 */
router.get('/users/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE address = $1', [address]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
export default router;
//# sourceMappingURL=user.js.map