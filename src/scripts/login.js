import { renderHeader } from './header.js';
import { renderFooter } from './footer.js';
  renderHeader();
  renderFooter();

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    const savedUser = JSON.parse(localStorage.getItem("sakpase_user"));
  
    if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
      alert("Invalid credentials. Please try again.");
      return;
    }
  
    localStorage.setItem("sakpase_logged_in", "true");
    window.location.href = "../dashboard/dashboard.html";
  });

  
  