const express = require("express");
const router = express.Router();
const { readInputs, readOutput, writeCoil } = require("../modbus");
const { logEvent } = require("../models/eventModel");
const { logLogin } = require("../models/userModel");
const db = require("../db"); // koneksi ke database

router.get("/input", async (req, res) => {
  const data = await readInputs();
  res.json({ input: data });
});

router.get("/output", async (req, res) => {
  const data = await readOutput();
  res.json({ output: data });
});

router.post("/button", async (req, res) => {
  const { index, state } = req.body;
  await writeCoil(index, state);

  let eventType = "";
  if (index % 4 === 1) eventType = "sounding";
  else if (index % 4 === 0) eventType = "silence";
  else if (index % 4 === 2) eventType = "reset";

  const zone = Math.floor(index / 4) + 1;
  if (eventType) await logEvent(eventType, zone);

  res.json({ success: true });
});

// ✅ Tambahan: Endpoint untuk melihat login history
router.get("/login-history", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM login_log ORDER BY login_time DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Gagal mengambil login history:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil login history" });
  }
});

module.exports = router;
