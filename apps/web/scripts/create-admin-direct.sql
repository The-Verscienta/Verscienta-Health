-- Direct SQL script to create first admin user
-- Run this when Payload admin UI has compatibility issues
--
-- Usage:
--   psql -U postgres -d verscienta_health -f scripts/create-admin-direct.sql
--
-- Or connect to your database and run these commands manually

-- First, check if users table exists and has any users
SELECT COUNT(*) as user_count FROM users;

-- If no users exist, insert the admin user
-- Password is: admin123456 (bcrypt hash)
-- IMPORTANT: Change this password after first login!
INSERT INTO users (
  email,
  "firstName",
  "lastName",
  role,
  password,
  "createdAt",
  "updatedAt"
)
SELECT
  'admin@verscienta.com',
  'Admin',
  'User',
  'admin',
  '$2a$10$YourBcryptHashHere',  -- This needs to be generated
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@verscienta.com');

-- Verify the user was created
SELECT id, email, "firstName", "lastName", role, "createdAt"
FROM users
WHERE email = 'admin@verscienta.com';
