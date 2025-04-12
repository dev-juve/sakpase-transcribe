export function renderFooter() {
    const footer = document.createElement("footer");
    footer.innerHTML = `
      <div class="container">
        <p>&copy; 2025 SakPase Transcribe. All rights reserved.</p>
      </div>
    `;
    document.body.appendChild(footer);
  }
  