const axios = require("axios");

axios
  .post("http://localhost:666/api/login", {
    username: "seci",
  })
  .then((res) => {
    console.log("✅ Login berhasil:", res.data);
  })
  .catch((err) => {
    console.error("❌ Gagal login:", err.message);
  });
