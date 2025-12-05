-- Diagnostic Query: Check for existing objects that might conflict
-- Run this query in Supabase SQL Editor to understand the current state

-- 1. Check if tool_sessions table exists
SELECT 'tool_sessions table exists' as check_type, EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'tool_sessions'
) as exists;

-- 2. Check if any tables reference tool_session_id
SELECT
  'Tables with tool_session_id column' as check_type,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tool_session_id';

-- 3. Check for views that might reference tool_session_id
SELECT
  'Views with tool_session_id' as check_type,
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND view_definition ILIKE '%tool_session_id%';

-- 4. Check for existing Problem Framing tables
SELECT
  'Existing PF tables' as check_type,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tool_sessions',
    'tool_items',
    'pf_individual_statements',
    'pf_statement_pins',
    'pf_final_statement',
    'pf_session_participants'
  )
ORDER BY tablename;

-- 5. Check for foreign key constraints that might be causing issues
SELECT
  'Foreign key constraints' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (kcu.column_name = 'tool_session_id' OR ccu.column_name = 'tool_session_id');

-- 6. Check for triggers that might reference these tables
SELECT
  'Triggers on PF tables' as check_type,
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'tool_sessions',
    'tool_items',
    'pf_individual_statements',
    'pf_statement_pins',
    'pf_final_statement',
    'pf_session_participants'
  );
