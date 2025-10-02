// GREETING
function getGreeting() {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return "GOOD MORNING,";
  } else if (hours < 18) {
    return "GOOD AFTERNOON,";
  } else {
    return "GOOD EVENING,";
  }
}

// Set greeting ke elemen dengan ID greeting
document.getElementById("greeting").textContent = getGreeting();
