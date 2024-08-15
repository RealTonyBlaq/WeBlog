-- Sets up the SQL server for the WeBlog
CREATE DATABASE IF NOT EXISTS weblog;
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin_pwd';
GRANT ALL PRIVILEGES ON weblog.* TO 'admin'@'localhost';
GRANT SELECT ON performance_schema.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
