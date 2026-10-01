-- Change the initial administrator credentials.
-- Username: mohammad
-- Password: mohammad
UPDATE users
SET username='mohammad',
    password_hash='rNXLkyfYmqZO+s/5/smm7TMj4iLc7lmrcEqERWTwcbQ=',
    password_salt='I5s1DVV0vgZCRrzfc5Vxtw=='
WHERE id='admin-1';
