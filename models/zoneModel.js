const db = require("../db");

async function logZoneEvent(zone, eventType, status = null) {
  // Paksa huruf kecil dan validasi isi enum
  const validEventTypes = [
    "fire_detected",
    "alarm",
    "sounding",
    "mute",
    "reset",
  ];
  const safeType = (eventType || "").toLowerCase();

  if (!validEventTypes.includes(safeType)) {
    throw new Error(`eventType '${eventType}' tidak valid`);
  }

  await db.query(
    "INSERT INTO zone_event_log (zone, event_type, status) VALUES (?, ?, ?)",
    [zone, safeType, status]
  );
}

module.exports = { logZoneEvent };
