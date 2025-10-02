// toggle-password.js

document.addEventListener("DOMContentLoaded", () => {
  const toggleIcon = document.getElementById("toggle-icon");
  const passwordInput = document.getElementById("password");

  // Pastikan elemen ditemukan sebelum menambahkan event
  if (toggleIcon && passwordInput) {
    // Saat ikon diklik
    toggleIcon.parentElement.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";

      // Toggle tipe input
      passwordInput.type = isHidden ? "text" : "password";

      // Ganti ikon
      toggleIcon.classList.toggle("fa-eye", !isHidden);
      toggleIcon.classList.toggle("fa-eye-slash", isHidden);
    });
  }
});
