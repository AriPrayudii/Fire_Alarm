const pool = require("./db");

(async () => {
  try {
    const [rows] = await pool.query("SELECT NOW()");
    console.log("✅ Koneksi berhasil:", rows);
  } catch (err) {
    console.error("❌ Gagal koneksi:", err.message);
  }
})();
