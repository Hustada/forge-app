-- Check recent auth audit events with correct JSON syntax
SELECT 
    created_at,
    ip_address,
    payload::json->>'email' as email,
    payload::json->>'event_type' as event_type,
    payload::json->>'error' as error,
    payload::json->>'action' as action,
    payload
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 30;

-- Check specifically for signup events
SELECT 
    created_at,
    payload
FROM auth.audit_log_entries
WHERE payload::text ILIKE '%signup%' 
   OR payload::text ILIKE '%confirm%'
   OR payload::text ILIKE '%email%'
ORDER BY created_at DESC
LIMIT 10;

-- Count recent email-related events
SELECT 
    COUNT(*) as count,
    DATE_TRUNC('hour', created_at) as hour
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;