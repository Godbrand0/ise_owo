import { supabase } from './db.js';

export async function upsertUser(address: string, username: string) {
    return supabase.from('users').upsert({
        address,
        username,
        last_updated: new Date().toISOString()
    }, { onConflict: 'address' });
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
    const filteredDetails: Record<string, any> = {};
    for (const [key, val] of Object.entries(details)) {
        if (ALLOWED_COLUMNS.has(key as keyof UserDetails) && val !== undefined) {
            filteredDetails[key] = val;
        }
    }

    if (Object.keys(filteredDetails).length === 0) return;

    filteredDetails.last_updated = new Date().toISOString();

    return supabase
        .from('users')
        .update(filteredDetails)
        .eq('address', address);
}

export async function getLeaderboard(limit = 10) {
    const { data, error } = await supabase
        .from('users')
        .select('address, username, current_score, tasks_completed')
        .order('current_score', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

