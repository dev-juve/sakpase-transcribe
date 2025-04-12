document.getElementById("getStartedBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem("sakpase_logged_in") === "true";
    window.location.href = isLoggedIn ? "/src/dashboard/dashboard.html" : "/src/auth/login.html";
  });