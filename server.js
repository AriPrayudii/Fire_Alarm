// FILE: server.js (versi lengkap dengan Web Push Notification + WhatsApp Notifikasi + DB Log)

// Konfigurasi dan Insisialisasi Server
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { readInputs, readOutput, writeCoil } = require("./modbus");
const { logLogin, getLoginHistory } = require("./models/userModel");
const { logEvent } = require("./models/eventModel");
const { logZoneEvent } = require("./models/zoneModel");
const { webpush } = require("./webpush");
const db = require("./db");
const axios = require("axios");
const qs = require("qs");

const app = express();
const PORT = 666;

const ultraMsgConfig = {
  instanceId: "13278123sad",
  token: "1298731236",
  to: "+6237246238472",
};

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));

let previousInputState = new Array(6).fill(false);
let previousOutputState = new Array(6).fill(false);
const hasSentWhatsApp = Array(6).fill(false);
const zoneMap = [1, 3, 4, 5, 6, 7];
let subscriptions = [];

function getZoneMessage(zone) {
  const messages = {
    1: "🔥 Kebakaran di ZONA 1: Parkir Kendaraan Motor 1 & 2",
    3: "🔥 Kebakaran di ZONA 3: Ruang server/Kaprodi Bisnis Digital",
    4: "🔥 Kebakaran di ZONA 4: Laboratorium Lantai 4",
    5: "🔥 Kebakaran di ZONA 5: Laboratorium Lantai 5",
    6: "🔥 Kebakaran di ZONA 6: Ruang Kelas Lantai 6",
    7: "🔥 Kebakaran di ZONA 7: Ruang Kelas Lantai 7",
  };
  return messages[zone];
}

async function sendWhatsAppMessage(zone) {
  const bodyMessage = getZoneMessage(zone);

  const data = qs.stringify({
    token: ultraMsgConfig.token,
    to: ultraMsgConfig.to,
    body: bodyMessage,
    priority: 1,
  });

  try {
    const response = await axios.post(
      `https://api.ultramsg.com/${ultraMsgConfig.instanceId}/messages/chat`,

      data,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    console.log(`✅ WhatsApp terkirim ke ${ultraMsgConfig.to}`);
  } catch (err) {
    console.error(`❌ Gagal kirim WA:`, err.response?.data || err.message);
  }
}

async function monitorInputChanges() {
  try {
    const currentState = await readInputs();
    if (!Array.isArray(currentState) || currentState.length !== 16) return;

    for (let i = 0; i < 6; i++) {
      const now = currentState[i];
      const before = previousInputState[i];
      const zone = zoneMap[i];

      const status = now ? "off" : "on";

      if (now !== before) {
        try {
          await logZoneEvent(zone, "fire_detected", status);
          console.log(
            `📥 Zona ${zone} fire_detected berubah ke ${status} → dicatat`
          );
        } catch (err) {
          console.warn(
            `⚠️ Gagal mencatat log input zona ${zone}:`,
            err.message
          );
        }
      }
    }

    previousInputState = currentState.slice(0, 6);
  } catch (err) {
    console.error("❌ Gagal membaca input:", err.message);
  }
}

async function monitorOutputChanges() {
  try {
    const currentState = await readOutput();
    if (!Array.isArray(currentState) || currentState.length !== 16) return;

    if (!Array.isArray(previousOutputState)) {
      previousOutputState = Array(16).fill(null);
    }

    const monitoredZones = zoneMap.map((zone, index) => ({
      zone,
      index,
    }));

    for (const { zone, index } of monitoredZones) {
      const now = currentState[index];
      const before = previousOutputState[index];

      if (now !== before) {
        const status = now ? "on" : "off";
        try {
          await logZoneEvent(zone, "alarm", status);
          console.log(`📥 Zona ${zone} alarm berubah ke ${status} → dicatat`);

          if (status === "on") {
            // Web Push
            if (Array.isArray(subscriptions)) {
              const payload = JSON.stringify({
                title: "🔥 PERINGATAN KEBAKARAN",
                body: `Alarm aktif di Zona ${zone}`,
                icon: "/assets/icons/alarm-icon.png",
                zone,
                event_type: "alarm",
              });

              for (const sub of subscriptions) {
                try {
                  await webpush.sendNotification(sub, payload);
                } catch (notifErr) {
                  console.warn(`⚠️ Gagal kirim notifikasi:`, notifErr.message);
                }
              }
            }

            // WhatsApp → hanya jika belum dikirim
            if (!hasSentWhatsApp[zone]) {
              await sendWhatsAppMessage(zone);
              hasSentWhatsApp[zone] = true;
            }
          } else {
            hasSentWhatsApp[zone] = false; // Reset saat alarm off
          }
        } catch (logErr) {
          console.warn(`⚠️ Gagal log zona ${zone}:`, logErr.message);
        }
      }
    }

    previousOutputState = [...currentState];
  } catch (err) {
    console.error("❌ Gagal membaca output:", err.message);
  }
}

setInterval(() => {
  monitorInputChanges();
  monitorOutputChanges();
}, 1000);

app.get("/api/input", async (req, res) => {
  try {
    const data = await readInputs();
    return res.json({ success: true, input: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/output", async (req, res) => {
  try {
    const data = await readOutput();
    return res.json({ success: true, output: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/button", async (req, res) => {
  const { index, state } = req.body;

  if (typeof index !== "number" || typeof state !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "Parameter tidak valid" });
  }

  try {
    await writeCoil(index, state);

    let eventType = "";
    let zone = null;

    if (index >= 14) {
      eventType = "reset";
      zone = "ALL";
    } else {
      zone = Math.floor(index / 2) + 1;
      eventType = state ? "sounding" : "mute";
    }

    await logZoneEvent(zone, eventType, state ? "on" : "off");
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false });

  try {
    await logLogin(username);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

app.get("/api/login-history", async (req, res) => {
  try {
    const history = await getLoginHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/subscribe", (req, res) => {
  const sub = req.body;
  subscriptions.push(sub);
  res.status(201).json({ message: "Subscribed" });
});

app.post("/send-alarm", async (req, res) => {
  const payload = JSON.stringify({
    title: "🚨 ALARM",
    body: "Kebakaran terdeteksi di Zona 1!",
    icon: "/assets/icons/alarm-icon.png",
    zone: 1,
  });

  try {
    for (const sub of subscriptions) {
      await webpush.sendNotification(sub, payload);
    }
    res.json({ message: "Notifikasi dikirim" });
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.get("/api/notifications", async (req, res) => {
  const { zone, event_type } = req.query;
  let sql = `SELECT zone, event_type, status, timestamp FROM zone_event_log WHERE status = 'on'`;
  const params = [];

  if (zone) {
    sql += " AND zone = ?";
    params.push(zone);
  }
  if (event_type) {
    sql += " AND event_type = ?";
    params.push(event_type);
  }

  sql += " ORDER BY timestamp DESC LIMIT 50";

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil histori notifikasi" });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server berjalan di http://localhost:${PORT}`);
});
