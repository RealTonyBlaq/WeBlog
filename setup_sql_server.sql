-- Sets up the SQL server for the 
DROP DATABASE IF EXISTS weblog;
CREATE DATABASE IF NOT EXISTS weblog;
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Password123';
GRANT ALL PRIVILEGES ON weblog.* TO 'admin'@'localhost';
GRANT SELECT ON performance_schema.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
