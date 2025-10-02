document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("login-error");

    // Simulasi validasi lokal
    if (username === "admin" && password === "admin") {
      try {
        // Kirim data login ke server (log ke database)
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });

        const result = await res.json();
        if (result.success) {
          localStorage.setItem("isLoggedIn", "true");
          window.location.href = "menu.html";
        } else {
          errorMessage.textContent = result.message || "Login gagal";
          errorMessage.classList.remove("hidden");
        }
      } catch (err) {
        errorMessage.textContent = "Tidak bisa terhubung ke server";
        errorMessage.classList.remove("hidden");
        console.error("❌ Gagal kirim ke server:", err);
      }
    } else {
      errorMessage.classList.remove("hidden");
    }
  });
