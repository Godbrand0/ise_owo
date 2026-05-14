import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';

const router = Router();

// To be provided in .env
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

/**
 * @route GET /api/auth/github
 * @desc Redirect to GitHub OAuth with Stacks address as state
 */
router.get('/auth/github', (req, res) => {
    const { address } = req.query;
    
    if (!address) {
        return res.status(400).json({ error: 'Missing Stacks address in query' });
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email&state=${address}`;
    res.redirect(githubAuthUrl);
});

/**
 * @route GET /api/auth/github/callback
 * @desc Exchange code for token, fetch GitHub user, and link to Stacks address
 */
router.get('/auth/github/callback', async (req, res) => {
    const { code, state: address } = req.query;

    if (!code || !address) {
        return res.status(400).json({ error: 'Invalid OAuth callback' });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: 'application/json' },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            throw new Error('Failed to obtain access token from GitHub');
        }

        // 2. Fetch user information from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });

        const githubUser = userResponse.data;
        const githubUsername = githubUser.login;

        // 3. Update user metadata in Supabase
        // Note: We only update github_username if the user exists or create a basic record
        // The registration page will handle the rest (role, username)
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                address: address as string,
                github_username: githubUsername,
                last_updated: new Date().toISOString()
            }, { onConflict: 'address' });

        if (upsertError) throw upsertError;

        // 4. Create a JWT for the session
        const sessionToken = jwt.sign(
            { address, github_username: githubUsername },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Set cookie and redirect back to frontend
        // We redirect back to /register or /profile depending on where they came from
        // For now, let's just go back to the app root or a specific auth success page
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        
        res.cookie('taskify_auth', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax',
        });

        res.redirect(`${frontendUrl}/register?github_verified=true&username=${githubUsername}`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/register?error=github_auth_failed`);
    }
});

/**
 * @route POST /api/auth/logout
 * @desc Clear auth cookie
 */
router.post('/auth/logout', (req, res) => {
    res.clearCookie('taskify_auth');
    res.json({ message: 'Logged out' });
});

export default router;
