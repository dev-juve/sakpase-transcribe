export function renderFooter() {
  const year = new Date().getFullYear();
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div class="container">
      <p>&copy; ${year} SakPase Transcribe. All rights reserved.</p>
    </div>
  `;
  document.body.appendChild(footer);
}
