-- Sets up the SQL server for the Project
DROP DATABASE IF EXISTS weblog_test;
CREATE DATABASE IF NOT EXISTS weblog_test;
CREATE USER IF NOT EXISTS 'test_admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Password123';
GRANT ALL PRIVILEGES ON weblog_test.* TO 'test_admin'@'localhost';
GRANT SELECT ON performance_schema.* TO 'test_admin'@'localhost';
FLUSH PRIVILEGES;
