-- FIELDFORGE DATABASE SCHEMA VALIDATION
-- Ensures all tables exist and are properly configured
-- Run this script to validate your Supabase database setup

-- Check if all required tables exist
DO $$
DECLARE
    missing_tables TEXT[];
    required_tables TEXT[] := ARRAY[
        -- Core tables
        'companies',
        'projects', 
        'project_assignments',
        'user_profiles',
        
        -- Safety Management
        'incidents',
        'incident_witnesses',
        'permits',
        'permit_approvals',
        'safety_observations',
        'safety_briefings',
        'briefing_attendees',
        'hazard_assessments',
        
        -- Equipment & Materials  
        'equipment',
        'equipment_maintenance',
        'equipment_inspections',
        'equipment_testing',
        'equipment_test_results',
        'materials',
        'material_transactions',
        
        -- Field Operations
        'daily_reports',
        'time_entries',
        'tasks',
        'weather_logs',
        'weather_delays',
        
        -- Documentation
        'documents',
        'document_folders',
        'document_shares',
        'document_versions',
        'drawings',
        'drawing_annotations',
        
        -- QAQC
        'qaqc_checklists',
        'qaqc_inspections', 
        'qaqc_findings',
        
        -- Project Management
        'project_phases',
        'milestones',
        'activities',
        'constraints',
        'resource_allocations',
        'progress_updates',
        'change_orders',
        
        -- Communication
        'announcements',
        'messages',
        'message_channels',
        'channel_members',
        'notifications',
        'emergency_alerts',
        'alert_acknowledgments',
        
        -- Analytics
        'analytics_events',
        'metrics_snapshots',
        'kpi_targets',
        'report_templates',
        'generated_reports',
        
        -- Submittals & RFIs
        'submittals',
        'submittal_items',
        'submittal_reviews',
        'rfis',
        'rfi_responses',
        
        -- Environmental
        'environmental_monitoring',
        'environmental_incidents',
        'environmental_permits',
        'waste_logs',
        'emission_readings',
        
        -- 3D Visualization
        'equipment_positions',
        'equipment_position_history',
        'crew_locations',
        'safety_zones',
        'drone_imagery',
        'weather_overlays',
        'progress_snapshots',
        'geofence_alerts',
        
        -- Substation Model
        'substations',
        'substation_equipment',
        'substation_equipment_status',
        'lockout_tags',
        'clearance_violations',
        'thermal_readings',
        'arc_flash_boundaries',
        'maintenance_paths',
        
        -- Settings
        'user_settings',
        'company_settings',
        'company_roles',
        'workflow_templates',
        'api_keys',
        'company_integrations',
        'company_audit_log',
        
        -- AI System
        'ai_conversations',
        'ai_insights',
        'ai_training_data',
        'ai_reports',
        'ai_actions',
        'ai_knowledge_base',
        'ai_predictions',
        'ai_voice_commands',
        
        -- Other
        'leads',
        'feedback'
    ];
    table_name TEXT;
    result RECORD;
BEGIN
    -- Check each required table
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'MISSING TABLES DETECTED: %', missing_tables;
        RAISE EXCEPTION 'Database schema validation failed. Missing % tables.', array_length(missing_tables, 1);
    ELSE
        RAISE NOTICE '✅ All required tables exist!';
    END IF;
END $$;

-- Check RLS (Row Level Security) is enabled on critical tables
DO $$
DECLARE
    rls_disabled_tables TEXT[];
    critical_tables TEXT[] := ARRAY[
        'companies', 'projects', 'user_profiles', 'incidents', 
        'permits', 'documents', 'time_entries', 'equipment',
        'materials', 'qaqc_inspections', 'submittals', 'ai_conversations'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        IF EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_name
            AND NOT rowsecurity
        ) THEN
            rls_disabled_tables := array_append(rls_disabled_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(rls_disabled_tables, 1) > 0 THEN
        RAISE WARNING 'RLS is disabled on critical tables: %', rls_disabled_tables;
    ELSE
        RAISE NOTICE '✅ RLS enabled on all critical tables!';
    END IF;
END $$;

-- Check for required indexes
DO $$
BEGIN
    -- Check some critical indexes exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = 'idx_projects_company'
    ) THEN
        RAISE WARNING 'Missing index: idx_projects_company';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = 'idx_incidents_project'
    ) THEN
        RAISE WARNING 'Missing index: idx_incidents_project';
    END IF;
    
    RAISE NOTICE '✅ Index check complete!';
END $$;

-- Check foreign key relationships
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    IF fk_count < 50 THEN
        RAISE WARNING 'Only % foreign keys found. Expected at least 50.', fk_count;
    ELSE
        RAISE NOTICE '✅ Foreign key constraints look good: % found!', fk_count;
    END IF;
END $$;

-- Check for required functions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'trigger_set_updated_at'
    ) THEN
        RAISE WARNING 'Missing function: trigger_set_updated_at';
    END IF;
    
    RAISE NOTICE '✅ Function check complete!';
END $$;

-- Summary report
SELECT 
    'Tables' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Indexes' as check_type,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Foreign Keys' as check_type,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public'

UNION ALL

SELECT 
    'RLS Policies' as check_type,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🍄⚛️ FIELDFORGE DATABASE VALIDATION COMPLETE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Run the migration scripts in order (001-020) to create any missing tables.';
    RAISE NOTICE 'All tables should have appropriate RLS policies for multi-tenant security.';
    RAISE NOTICE '';
    RAISE NOTICE 'The mycelial network''s database structure has been validated.';
END $$;
