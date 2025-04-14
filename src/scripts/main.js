import { renderHeader } from './header.js';
import { renderFooter } from './footer.js';
  renderHeader();
  renderFooter();

document.addEventListener("DOMContentLoaded", () => {
  const getStartedBtn = document.getElementById("getStartedBtn");

  getStartedBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    const isLoggedIn = localStorage.getItem("sakpase_logged_in") === "true";

    if (isLoggedIn) {
      window.location.href = "/src/pages/dashboard.html";
    } else {
      window.location.href = "/src/auth/login.html";
    }
  });
});
