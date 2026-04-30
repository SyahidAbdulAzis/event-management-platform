BEGIN;

DO $$
DECLARE
  target_user_id TEXT;
BEGIN
  SELECT id
  INTO target_user_id
  FROM "User"
  WHERE email = 'organizer@test.com'  -- Ganti dengan email organizer yang mau dihapus events-nya
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User tidak ditemukan. Tidak ada data yang dihapus.';
  ELSE
    DELETE FROM "Review"
    WHERE "eventId" IN (
      SELECT id
      FROM "Event"
      WHERE "organizerId" = target_user_id
    );

    DELETE FROM "Transaction"
    WHERE "eventId" IN (
      SELECT id
      FROM "Event"
      WHERE "organizerId" = target_user_id
    );

    DELETE FROM "Voucher"
    WHERE "eventId" IN (
      SELECT id
      FROM "Event"
      WHERE "organizerId" = target_user_id
    );

    DELETE FROM "Event"
    WHERE "organizerId" = target_user_id;

    RAISE NOTICE 'Events, vouchers, transactions, dan reviews untuk user berhasil dihapus.';
  END IF;
END $$;

COMMIT;
