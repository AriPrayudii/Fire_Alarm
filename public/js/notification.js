let unreadNotifications = 0;
let notificationHistory = [];

// Format waktu lokal (contoh: 22:45:02)
function formatTime(date) {
  return new Date(date).toLocaleTimeString("id-ID", { hour12: false });
}

// Format teks jenis event
function formatEventType(eventType) {
  switch (eventType) {
    case "alarm":
      return "Alarm Aktif";
    default:
      return eventType;
  }
}

// Tambahkan notifikasi ke riwayat, hindari duplikat
function addNotification(zone, eventType = "alarm", time = null) {
  const timestamp = time || new Date().toISOString();
  const formattedTime = formatTime(timestamp);

  // Cek duplikat
  const isDuplicate = notificationHistory.some(
    (n) =>
      n.zone === zone && n.event_type === eventType && n.time === formattedTime
  );
  if (isDuplicate) return;

  // Tambahkan ke awal array
  notificationHistory.unshift({
    zone,
    event_type: eventType,
    time: formattedTime,
  });

  unreadNotifications++;
  updateNotificationBadge();
  updateNotificationPopup();
}

// Update badge jumlah notifikasi belum dibaca
function updateNotificationBadge() {
  const badge = document.getElementById("notification-count");
  if (unreadNotifications > 0) {
    badge.textContent = unreadNotifications;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// Tampilkan daftar notifikasi
function updateNotificationPopup() {
  const popup = document.getElementById("notification-popup");

  if (notificationHistory.length === 0) {
    popup.innerHTML = `<div class="text-gray-600">Tidak ada notifikasi baru.</div>`;
    return;
  }

  let html = `<div class="font-semibold text-sm mb-2 text-red-700">🔥 Notifikasi Kebakaran</div>`;
  html += `<ul class="mb-2 space-y-1 max-h-40 overflow-y-auto">`;

  notificationHistory.forEach((n) => {
    html += `<li class="text-sm text-gray-800">
      Zona ${n.zone} – 
      <span class="text-blue-700 font-semibold">${formatEventType(
        n.event_type
      )}</span>
      <span class="text-xs text-gray-500 ml-1">${n.time}</span>
    </li>`;
  });

  html += `</ul>`;
  html += `<button onclick="resetNotificationBadge()" class="text-red-600 hover:underline text-sm">Tandai sudah dibaca</button>`;

  popup.innerHTML = html;
}

// Reset badge (tandai sudah dibaca)
function resetNotificationBadge() {
  unreadNotifications = 0;
  updateNotificationBadge();
}

// Toggle tampilan popup saat ikon lonceng diklik
document.getElementById("bell-button").addEventListener("click", () => {
  const popup = document.getElementById("notification-popup");
  popup.classList.toggle("hidden");
});

// Terima notifikasi dari Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "new-notification") {
      const zone = event.data.zone || "?";
      const eventType = event.data.event_type || "alarm";
      addNotification(zone, eventType);
      document.getElementById("notification-popup")?.classList.remove("hidden");
    }
  });
}

// Ambil histori dari server saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/notifications");
    const data = await res.json();

    if (Array.isArray(data)) {
      data.forEach((item) => {
        addNotification(item.zone, item.event_type, item.timestamp);
      });

      unreadNotifications = 0; // Anggap sudah dibaca saat load awal
      updateNotificationBadge();
      updateNotificationPopup();
    }
  } catch (err) {
    console.error("❌ Gagal mengambil histori notifikasi:", err);
  }
});
