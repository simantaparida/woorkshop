-- Minimal check to see what exists
-- Run this first to diagnose the issue

SELECT
  'Tables' as object_type,
  tablename as name
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%tool%'
ORDER BY tablename;
