-- Database Schema for Taskify Backend

-- Users and Leaderboard
CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    total_stx_funded BIGINT DEFAULT 0,
    total_usdcx_funded BIGINT DEFAULT 0,
    avg_tip_percent NUMERIC(5,2) DEFAULT 0,
    current_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for scoring performance
CREATE INDEX IF NOT EXISTS idx_user_score ON users(current_score DESC);

-- AI Insights Cache
CREATE TABLE IF NOT EXISTS insights_cache (
    cache_key TEXT PRIMARY KEY, -- general:YYYY-MM or personal:address:YYYY-MM
    insight TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tasks Metadata (Off-chain)
CREATE TABLE IF NOT EXISTS tasks_metadata (
    task_id INTEGER PRIMARY KEY,
    github_link TEXT,
    description_raw TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
