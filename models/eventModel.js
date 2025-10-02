const db = require("../db");

async function logEvent(type, zone) {
  await db.query(
    "INSERT INTO event_log (event_type, zone, timestamp) VALUES (?, ?, NOW())",
    [type, zone]
  );
}

module.exports = { logEvent };
