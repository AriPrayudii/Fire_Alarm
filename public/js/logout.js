// FILE: js/logout.js

// Jalankan setelah semua konten dimuat
document.addEventListener("DOMContentLoaded", () => {
  const profileButton = document.getElementById("profile-button");
  const dropdownMenu = document.getElementById("dropdown-menu");

  // Jika tombol profil dan dropdown ditemukan
  if (profileButton && dropdownMenu) {
    // Klik tombol profil = toggle dropdown
    profileButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Jangan teruskan ke parent
      dropdownMenu.classList.toggle("hidden");
    });

    // Klik di luar dropdown = tutup dropdown
    document.addEventListener("click", () => {
      dropdownMenu.classList.add("hidden");
    });
  }
});

// Fungsi logout
function logout() {
  // Hapus status login
  localStorage.removeItem("isLoggedIn");

  // Alert opsional
  alert("Anda berhasil logout.");

  // Redirect ke halaman login
  window.location.href = "login.html";
}
