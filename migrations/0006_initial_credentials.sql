-- Initial admin credentials: username and password are both "mohammadmohammad".
-- Change them after first login from the settings panel (gear icon).
UPDATE users SET username='mohammadmohammad',
 password_hash='LAYi/oR+6yTd21pg1idkdjFlFRWEIIgxL2Mw/iZwcuc=',
 password_salt='3zAb5eYnZBGpOifbeO/2XQ==',
 session_version=session_version+1
WHERE id='admin-1';
