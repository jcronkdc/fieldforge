-- SongForge Database Schema
-- Versioned relational database with profitability tables
-- PostgreSQL with TimescaleDB for time-series data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Songs table
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'published', 'archived')),
    genre VARCHAR(50),
    tempo INTEGER,
    key VARCHAR(10),
    time_signature VARCHAR(10) DEFAULT '4/4',
    mood VARCHAR(50),
    mask_id VARCHAR(100),
    tone_profile JSONB,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    parent_version_id UUID REFERENCES songs(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Profitability fields
    profit_tier VARCHAR(20) DEFAULT 'free' CHECK (profit_tier IN ('free', 'creator', 'pro', 'studio')),
    compute_cost DECIMAL(10, 4) DEFAULT 0,
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    
    -- Statistics
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    remix_count INTEGER DEFAULT 0,
    
    -- Indexes
    INDEX idx_songs_user_id (user_id),
    INDEX idx_songs_status (status),
    INDEX idx_songs_genre (genre),
    INDEX idx_songs_created_at (created_at),
    INDEX idx_songs_profit_tier (profit_tier)
);

-- Song sections table
CREATE TABLE song_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('intro', 'verse', 'chorus', 'bridge', 'outro', 'pre_chorus', 'post_chorus', 'instrumental', 'custom')),
    order_index INTEGER NOT NULL,
    name VARCHAR(100),
    duration_ms INTEGER,
    repeat_count INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(song_id, order_index),
    INDEX idx_sections_song_id (song_id),
    INDEX idx_sections_type (section_type)
);

-- Lyrics table
CREATE TABLE lyrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    section_id UUID REFERENCES song_sections(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    syllable_count INTEGER,
    rhyme_scheme VARCHAR(10),
    emphasis_pattern VARCHAR(100),
    timing_ms INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(song_id, section_id, line_number),
    INDEX idx_lyrics_song_id (song_id),
    INDEX idx_lyrics_section_id (section_id)
);

-- Melody table
CREATE TABLE melodies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    section_id UUID REFERENCES song_sections(id) ON DELETE CASCADE,
    segment_index INTEGER NOT NULL,
    pitch_sequence JSONB NOT NULL, -- Array of MIDI notes
    rhythm_pattern JSONB NOT NULL,
    chord_progression VARCHAR(100),
    dynamics JSONB,
    articulation JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(song_id, section_id, segment_index),
    INDEX idx_melodies_song_id (song_id),
    INDEX idx_melodies_section_id (section_id)
);

-- =====================================================
-- COLLABORATION TABLES
-- =====================================================

-- Collaboration sessions table
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    host_id UUID NOT NULL,
    session_code VARCHAR(20) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    max_collaborators INTEGER DEFAULT 10,
    allow_spectators BOOLEAN DEFAULT TRUE,
    auto_save BOOLEAN DEFAULT TRUE,
    require_approval BOOLEAN DEFAULT FALSE,
    conflict_resolution VARCHAR(20) DEFAULT 'last-write-wins',
    version_interval INTEGER DEFAULT 60000, -- milliseconds
    current_version INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    metadata JSONB,
    
    INDEX idx_collab_song_id (song_id),
    INDEX idx_collab_host_id (host_id),
    INDEX idx_collab_status (status),
    INDEX idx_collab_session_code (session_code)
);

-- Session collaborators table
CREATE TABLE session_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'spectator')),
    permissions JSONB NOT NULL,
    color VARCHAR(7), -- Hex color for UI
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    edit_count INTEGER DEFAULT 0,
    
    UNIQUE(session_id, user_id),
    INDEX idx_collab_users_session_id (session_id),
    INDEX idx_collab_users_user_id (user_id),
    INDEX idx_collab_users_role (role)
);

-- Edit history table
CREATE TABLE edit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('add', 'update', 'delete', 'move')),
    previous_value JSONB,
    new_value JSONB,
    version INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_edit_history_session_id (session_id),
    INDEX idx_edit_history_song_id (song_id),
    INDEX idx_edit_history_user_id (user_id),
    INDEX idx_edit_history_timestamp (timestamp)
);

-- =====================================================
-- REMIX TABLES
-- =====================================================

-- Remixes table
CREATE TABLE remixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_song_id UUID NOT NULL REFERENCES songs(id),
    remix_song_id UUID NOT NULL REFERENCES songs(id),
    remixer_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'published', 'archived')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    allow_further_remix BOOLEAN DEFAULT TRUE,
    credit_original BOOLEAN DEFAULT TRUE,
    split_revenue BOOLEAN DEFAULT FALSE,
    revenue_share DECIMAL(3, 2) DEFAULT 0.10, -- Percentage to original creator
    lineage_depth INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Statistics
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    further_remix_count INTEGER DEFAULT 0,
    
    INDEX idx_remixes_original_song_id (original_song_id),
    INDEX idx_remixes_remix_song_id (remix_song_id),
    INDEX idx_remixes_remixer_id (remixer_id),
    INDEX idx_remixes_status (status),
    INDEX idx_remixes_visibility (visibility)
);

-- Remix lineage table
CREATE TABLE remix_lineage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remix_id UUID NOT NULL REFERENCES remixes(id) ON DELETE CASCADE,
    ancestor_song_id UUID NOT NULL REFERENCES songs(id),
    generation INTEGER NOT NULL,
    path_to_ancestor TEXT[], -- Array of song IDs showing the path
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(remix_id, ancestor_song_id),
    INDEX idx_lineage_remix_id (remix_id),
    INDEX idx_lineage_ancestor_id (ancestor_song_id)
);

-- Remix changes tracking table
CREATE TABLE remix_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remix_id UUID NOT NULL REFERENCES remixes(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL,
    change_description TEXT,
    target_element JSONB,
    original_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_remix_changes_remix_id (remix_id),
    INDEX idx_remix_changes_type (change_type)
);

-- =====================================================
-- PROFITABILITY TABLES
-- =====================================================

-- Pricing tiers table
CREATE TABLE pricing_tiers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(20) DEFAULT 'monthly',
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    margin DECIMAL(3, 2) NOT NULL,
    cvi DECIMAL(3, 2), -- Customer Value Index
    churn_rate DECIMAL(3, 2),
    user_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_tiers_price (price)
);

-- Feature costs table
CREATE TABLE feature_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_id VARCHAR(100) NOT NULL UNIQUE,
    feature_name VARCHAR(255) NOT NULL,
    base_cost DECIMAL(10, 6) NOT NULL,
    token_cost DECIMAL(10, 6),
    compute_cost DECIMAL(10, 6),
    storage_cost DECIMAL(10, 6),
    bandwidth_cost DECIMAL(10, 6),
    overhead_allocation DECIMAL(3, 2) DEFAULT 0.25,
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_feature_costs_feature_id (feature_id)
);

-- Usage tracking table (TimescaleDB hypertable)
CREATE TABLE usage_tracking (
    time TIMESTAMPTZ NOT NULL,
    user_id UUID NOT NULL,
    feature_id VARCHAR(100) NOT NULL,
    tier_id VARCHAR(20) REFERENCES pricing_tiers(id),
    usage_count INTEGER DEFAULT 1,
    tokens_used INTEGER,
    compute_hours DECIMAL(10, 6),
    storage_gb DECIMAL(10, 6),
    bandwidth_gb DECIMAL(10, 6),
    cost DECIMAL(10, 6),
    revenue DECIMAL(10, 6),
    margin DECIMAL(3, 2),
    
    PRIMARY KEY (time, user_id, feature_id)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('usage_tracking', 'time');

-- Revenue tracking table (TimescaleDB hypertable)
CREATE TABLE revenue_tracking (
    time TIMESTAMPTZ NOT NULL,
    user_id UUID NOT NULL,
    source VARCHAR(50) NOT NULL, -- subscription, song_sale, remix, collab, tip
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tier_id VARCHAR(20),
    transaction_id VARCHAR(100),
    metadata JSONB,
    
    PRIMARY KEY (time, user_id, source)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('revenue_tracking', 'time');

-- Profitability metrics table (TimescaleDB hypertable)
CREATE TABLE profitability_metrics (
    time TIMESTAMPTZ NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- margin, cvi, elasticity, churn
    tier_id VARCHAR(20),
    value DECIMAL(10, 6) NOT NULL,
    target_value DECIMAL(10, 6),
    variance DECIMAL(10, 6),
    metadata JSONB,
    
    PRIMARY KEY (time, metric_type)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('profitability_metrics', 'time');

-- Pricing adjustments log
CREATE TABLE pricing_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_id VARCHAR(20) REFERENCES pricing_tiers(id),
    feature_id VARCHAR(100),
    adjustment_type VARCHAR(50) NOT NULL,
    old_value DECIMAL(10, 6),
    new_value DECIMAL(10, 6),
    reason TEXT,
    impact_assessment JSONB,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    rolled_back BOOLEAN DEFAULT FALSE,
    rolled_back_at TIMESTAMPTZ,
    
    INDEX idx_adjustments_tier_id (tier_id),
    INDEX idx_adjustments_feature_id (feature_id),
    INDEX idx_adjustments_applied_at (applied_at)
);

-- =====================================================
-- SPARK ECONOMY TABLES
-- =====================================================

-- Spark balances table
CREATE TABLE spark_balances (
    user_id UUID PRIMARY KEY,
    available INTEGER NOT NULL DEFAULT 0,
    pending INTEGER DEFAULT 0,
    lifetime INTEGER DEFAULT 0,
    tier VARCHAR(20) REFERENCES pricing_tiers(id),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (available >= 0),
    INDEX idx_spark_balances_tier (tier)
);

-- Spark transactions table
CREATE TABLE spark_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'bonus', 'refund', 'purchase')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_spark_tx_user_id (user_id),
    INDEX idx_spark_tx_type (type),
    INDEX idx_spark_tx_timestamp (timestamp)
);

-- Spark packages table
CREATE TABLE spark_packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sparks INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    bonus_sparks INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_spark_packages_active (active)
);

-- =====================================================
-- NOTIFICATION TABLES
-- =====================================================

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url TEXT,
    action_label VARCHAR(100),
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_read (read),
    INDEX idx_notifications_created_at (created_at)
);

-- Activity feed table
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entity_id UUID,
    entity_type VARCHAR(50),
    actors JSONB, -- Array of user objects
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_activity_user_id (user_id),
    INDEX idx_activity_type (type),
    INDEX idx_activity_timestamp (timestamp),
    INDEX idx_activity_entity (entity_id, entity_type)
);

-- =====================================================
-- VAULT AND GROUP TABLES
-- =====================================================

-- Private vaults table
CREATE TABLE private_vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    owner_id UUID NOT NULL,
    max_members INTEGER DEFAULT 20,
    require_invite BOOLEAN DEFAULT TRUE,
    allow_export BOOLEAN DEFAULT TRUE,
    encrypt_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_vaults_owner_id (owner_id)
);

-- Vault members table
CREATE TABLE vault_members (
    vault_id UUID NOT NULL REFERENCES private_vaults(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'contributor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID,
    
    PRIMARY KEY (vault_id, user_id),
    INDEX idx_vault_members_user_id (user_id)
);

-- Vault songs table
CREATE TABLE vault_songs (
    vault_id UUID NOT NULL REFERENCES private_vaults(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    added_by UUID NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (vault_id, song_id),
    INDEX idx_vault_songs_song_id (song_id)
);

-- Collaboration groups table
CREATE TABLE collaboration_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    creator_id UUID NOT NULL,
    max_members INTEGER DEFAULT 50,
    allow_remix BOOLEAN DEFAULT TRUE,
    share_revenue BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'private',
    require_invite BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_groups_creator_id (creator_id)
);

-- Group members table
CREATE TABLE group_members (
    group_id UUID NOT NULL REFERENCES collaboration_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (group_id, user_id),
    INDEX idx_group_members_user_id (user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Full-text search indexes
CREATE INDEX idx_songs_title_fts ON songs USING gin(to_tsvector('english', title));
CREATE INDEX idx_lyrics_text_fts ON lyrics USING gin(to_tsvector('english', text));

-- Trigram indexes for fuzzy search
CREATE INDEX idx_songs_title_trgm ON songs USING gin(title gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_songs_user_status ON songs(user_id, status);
CREATE INDEX idx_remixes_original_status ON remixes(original_song_id, status);
CREATE INDEX idx_collab_song_status ON collaboration_sessions(song_id, status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON song_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lyrics_updated_at BEFORE UPDATE ON lyrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_melodies_updated_at BEFORE UPDATE ON melodies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tiers_updated_at BEFORE UPDATE ON pricing_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Spark balance update trigger
CREATE OR REPLACE FUNCTION update_spark_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE spark_balances
    SET available = available + 
        CASE 
            WHEN NEW.type IN ('earned', 'bonus', 'refund', 'purchase') THEN NEW.amount
            WHEN NEW.type = 'spent' THEN -NEW.amount
            ELSE 0
        END,
        lifetime = lifetime + 
        CASE 
            WHEN NEW.type IN ('earned', 'bonus', 'purchase') THEN NEW.amount
            ELSE 0
        END,
        last_updated = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spark_balance_on_transaction AFTER INSERT ON spark_transactions
    FOR EACH ROW EXECUTE FUNCTION update_spark_balance();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default pricing tiers
INSERT INTO pricing_tiers (id, name, price, features, limits, margin, cvi, churn_rate) VALUES
('free', 'Free', 0.00, 
    '{"basic_editing": true, "export_mp3": true, "collaboration": false}'::jsonb,
    '{"songs_per_month": 3, "ai_generations_per_day": 5, "storage_gb": 0.5}'::jsonb,
    0.00, 0.50, 0.40),
('creator', 'Creator', 9.99,
    '{"all_free": true, "collaboration": true, "remixes": true, "ai_generation": true}'::jsonb,
    '{"songs_per_month": 20, "ai_generations_per_day": 50, "storage_gb": 10}'::jsonb,
    0.65, 0.75, 0.15),
('pro', 'Pro', 29.99,
    '{"all_creator": true, "commercial_use": true, "advanced_ai": true, "priority_support": true}'::jsonb,
    '{"songs_per_month": 100, "ai_generations_per_day": 200, "storage_gb": 100}'::jsonb,
    0.72, 0.85, 0.08),
('studio', 'Studio', 99.99,
    '{"all_pro": true, "unlimited_everything": true, "white_label": true, "api_access": true}'::jsonb,
    '{"songs_per_month": -1, "ai_generations_per_day": -1, "storage_gb": 1000}'::jsonb,
    0.80, 0.95, 0.05);

-- Insert default Spark packages
INSERT INTO spark_packages (id, name, sparks, price, bonus_sparks) VALUES
('starter', 'Starter Pack', 100, 4.99, 0),
('popular', 'Popular Pack', 500, 19.99, 50),
('pro', 'Pro Pack', 1200, 39.99, 200),
('studio', 'Studio Pack', 3000, 89.99, 600);

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Create roles
CREATE ROLE songforge_read;
CREATE ROLE songforge_write;
CREATE ROLE songforge_admin;

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO songforge_read;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO songforge_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO songforge_admin;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO songforge_write;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO songforge_admin;
