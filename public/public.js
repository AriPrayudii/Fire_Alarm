if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker.register("/service-worker.js").then(async (reg) => {
    console.log("✅ Service Worker terdaftar.");

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BLn8IWooswAQdiGNwc6w9ZuFISvVpI4T_2FuSAkj1u6Z2S8kVNpH7drXb8zmXGOpU-u-bP6rp211d78qX4pHYkM"
      ),
    });

    await fetch("/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });

    console.log("✅ Push subscription berhasil.");
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
