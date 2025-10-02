const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306, // Default MySQL port (sesuai XAMPP)
  user: "root",
  password: "",
  database: "fire_alarm", // Nama database yang dibuat
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
