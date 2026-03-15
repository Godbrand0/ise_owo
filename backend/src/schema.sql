-- Database Schema for Taskify Backend (CLEAN SLATE)
-- WARNING: This will delete everything in these tables!

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS insights_cache CASCADE;
DROP TABLE IF EXISTS tasks_metadata CASCADE;

-- 1. Users table (address is PK)
CREATE TABLE users (
    address TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    github_username TEXT,
    role TEXT,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    total_stx_funded BIGINT DEFAULT 0,
    total_usdcx_funded BIGINT DEFAULT 0,
    avg_tip_percent NUMERIC(5,2) DEFAULT 0,
    current_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for scoring performance
CREATE INDEX idx_user_score ON users(current_score DESC);

-- 2. AI Insights Cache
CREATE TABLE insights_cache (
    cache_key TEXT PRIMARY KEY, 
    insight TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Tasks Metadata (Off-chain)
CREATE TABLE tasks_metadata (
    task_id INTEGER PRIMARY KEY,
    github_link TEXT,
    description_raw TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);




