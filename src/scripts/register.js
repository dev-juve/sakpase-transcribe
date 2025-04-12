import { renderHeader } from './header.js';
import { renderFooter } from './footer.js';
  renderHeader();
  renderFooter();

document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    const user = { username, email, password };
    localStorage.setItem("sakpase_user", JSON.stringify(user));
    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";
  });

  