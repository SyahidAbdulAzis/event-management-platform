BEGIN;

DO $$
DECLARE
  target_user_id TEXT;
BEGIN
  SELECT id
  INTO target_user_id
  FROM "User"
  WHERE email = 'customer2@test.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User customer2@test.com tidak ditemukan. Tidak ada data yang dihapus.';
  ELSE
    DELETE FROM "PointHistory"
    WHERE "userId" = target_user_id;

    DELETE FROM "Coupon"
    WHERE "userId" = target_user_id;

    DELETE FROM "Transaction"
    WHERE "customerId" = target_user_id;

    DELETE FROM "Review"
    WHERE "customerId" = target_user_id;

    DELETE FROM "User"
    WHERE id = target_user_id;

    RAISE NOTICE 'User customer2@test.com dan data terkait berhasil dihapus.';
  END IF;
END $$;

COMMIT;
