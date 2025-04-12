export function renderHeader() {
    const header = document.createElement("header");
    header.innerHTML = `
      <div class="container">
        <h1><a href="/index.html">SakPase Transcribe</a></h1>
        <nav>
          <a href="/src/auth/login.html">Login</a>
          <a href="/src/auth/register.html">Register</a>
        </nav>
      </div>
    `;
    document.body.prepend(header);
  }
  