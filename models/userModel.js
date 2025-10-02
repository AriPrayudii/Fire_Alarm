const db = require("../db");

// Fungsi untuk menyimpan log login
async function logLogin(username) {
  await db.query(
    "INSERT INTO login_log (username, login_time) VALUES (?, NOW())",
    [username]
  );
}

// 🔥 Fungsi untuk mengambil riwayat login
async function getLoginHistory() {
  const [rows] = await db.query(
    "SELECT * FROM login_log ORDER BY login_time DESC"
  );
  return rows;
}

module.exports = { logLogin, getLoginHistory };
