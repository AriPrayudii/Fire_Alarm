const db = require("./db");

async function setup() {
  try {
    // === Buat tabel login_log ===
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabel 'login_log' berhasil dibuat");

    // === Buat tabel zone_event_log ===
    await db.query(`
      CREATE TABLE IF NOT EXISTS zone_event_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        zone INT NOT NULL,
        event_type ENUM('fire_detected', 'alarm', 'sounding', 'mute', 'reset') NOT NULL,
        status ENUM('on', 'off') DEFAULT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabel 'zone_event_log' berhasil dibuat");
  } catch (err) {
    console.error("❌ Gagal membuat tabel:", err.message);
  } finally {
    db.end(); // Tutup koneksi database
    process.exit(); // Keluar dari script
  }
}

setup();
