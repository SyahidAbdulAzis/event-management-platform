-- Delete all events
-- Use this script to clean up database for testing/simulation

-- Start transaction for safety
BEGIN;

-- Delete all events
DELETE FROM events;

-- Commit the transaction
COMMIT;

-- Verify deletion
SELECT COUNT(*) as remaining_events FROM events;
