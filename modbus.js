// FILE: modbus.js
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

// === KONFIGURASI ===
const IP = "192.168.1.11"; // Alamat IP perangkat Modbus
const PORT = 502; // Port TCP Modbus
const SLAVE_ID = 1; // Slave ID Modbus RTU

// === KONEKSI ===
async function connectModbus() {
  try {
    if (!client.isOpen) {
      await client.connectTCP(IP, { port: PORT });
      client.setID(SLAVE_ID);
      console.log("✅ Modbus connected");
    }
  } catch (error) {
    console.error("❌ Failed to connect Modbus:", error.message);
  }
}

// === BACA INPUTS ===
// Mengambil status status detektor dari input alamat 0–16
async function readInputs() {
  try {
    await connectModbus();
    if (!client.isOpen) throw new Error("Port Not Open");

    const result = await client.readDiscreteInputs(0, 16);
    return result.data; // Array of boolean
  } catch (err) {
    console.error("❌ readInputs error:", err.message);
    return null;
  }
}

// === BACA COILS UNTUK STATUS ALARM ===
// Mengambil status alarm dari coil alamat 0–15
async function readOutput() {
  try {
    await connectModbus();
    if (!client.isOpen) throw new Error("Port Not Open");

    const result = await client.readCoils(0, 16);
    return result.data; // Array of boolean
  } catch (err) {
    console.error("❌ readOutput error:", err.message);
    return null;
  }
}

// === TULIS KE COIL UNTUK KONTROL (TOMBOL) ===
// Menulis ke coil dari coil alamat 128-143
async function writeCoil(index, value) {
  try {
    // Cegah penulisan ke alamat yang bisa bentrok dengan output status
    if (index < 0 || index > 15) throw new Error("Index out of range (0–15)");

    await connectModbus();
    if (!client.isOpen) throw new Error("Port Not Open");

    const addr = 128 + index;
    await client.writeCoil(addr, value);
    return true;
  } catch (err) {
    console.error("❌ writeCoil error:", err.message);
    return false;
  }
}

// === EKSPOR ===
module.exports = {
  readInputs, // Input dari detektor (Inputs 0–4)
  readOutput, // Output alarm status (Coils 0–15)
  writeCoil, // Kontrol tombol (Coils 128 - 143)
};
