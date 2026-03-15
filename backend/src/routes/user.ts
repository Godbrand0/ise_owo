import { Router } from 'express';
import { supabase } from '../db.js';

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
        const { data, error } = await supabase
            .from('users')
            .upsert({
                address,
                username,
                github_username,
                role,
                last_updated: new Date().toISOString()
            }, { onConflict: 'address' })
            .select();

        if (error) throw error;
        
        res.json({ message: 'User updated successfully', user: data[0] });
    } catch (error) {
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
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('address', address)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows found
                return res.status(404).json({ error: 'User not found' });
            }
            throw error;
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


export default router;
