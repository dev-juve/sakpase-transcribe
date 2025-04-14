// SakPase Transcribe - dashboard.js
// Author: Juvenson Elizaire ✨

import { renderFooter } from './footer.js';
renderFooter();

const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
const user = JSON.parse(localStorage.getItem("sakpase_user"));

const audioPlayer = document.getElementById("audioPlayer");
const editor = document.getElementById("transcriptionEditor");
const fileInput = document.getElementById("audioInput");
const uploadContent = document.getElementById("uploadContent");
const uploadForm = document.getElementById("uploadForm");
const resetBtn = document.getElementById("resetBtn");
const resetBtnTop = document.getElementById("resetBtnTop");
const uploadPreview = document.getElementById("uploadPreview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileDuration = document.getElementById("fileDuration");
const startTranscriptionBtn = document.getElementById("startTranscriptionBtn");

let uploadedAudioUrl = "";
let uploadedFile = null;

// Redirect unauthorized access
if (localStorage.getItem("sakpase_logged_in") !== "true") {
  window.location.href = "/src/auth/login.html";
}

// Welcome user
if (user) {
  const greeting = document.getElementById("greeting");
  if (greeting) greeting.textContent = `Welcome, ${user.username}!`;
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Upload Audio Handler
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file.");

  uploadedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";

  const tempAudio = new Audio(URL.createObjectURL(file));
  tempAudio.addEventListener("loadedmetadata", () => {
    fileDuration.textContent = tempAudio.duration
      ? formatDuration(tempAudio.duration)
      : "Unknown";
  });

  const uploadBar = document.getElementById("uploadBar");
  const uploadStatus = document.getElementById("uploadStatusText");
  document.getElementById("uploadProgress").classList.remove("hidden");

  uploadBar.classList.remove("success", "error");
  uploadBar.style.width = "10%";
  uploadStatus.textContent = "Uploading audio...";

  try {
    const interval = setInterval(() => {
      const current = parseFloat(uploadBar.style.width);
      if (current < 95) uploadBar.style.width = current + 5 + "%";
    }, 200);

    uploadedAudioUrl = await uploadAudio(file);
    clearInterval(interval);

    uploadBar.style.width = "100%";
    uploadBar.classList.add("success");
    uploadStatus.textContent = "Upload completed ✅";

    uploadPreview.classList.remove("hidden");
    uploadForm.classList.add("hidden"); // hide upload after success
  } catch (err) {
    uploadBar.classList.add("error");
    uploadStatus.textContent = "Upload failed ❌";
  }
});

async function uploadAudio(file) {
  const res = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { authorization: ASSEMBLYAI_API_KEY },
    body: file
  });
  const data = await res.json();
  return data.upload_url;
}

// Start Transcription
startTranscriptionBtn.addEventListener("click", () => {
  startTranscriptionBtn.disabled = true;
  startTranscriptionBtn.classList.add("disabled");

  const lang = document.getElementById("languageSelect").value;
  document.getElementById("transcribeProgress").classList.remove("hidden");
  document.getElementById("transcribeBar").classList.remove("success", "error");
  document.getElementById("transcribeBar").style.width = "10%";
  fileInput.value = "";
  startTranscription(uploadedAudioUrl, lang);
});

async function transcribeAudio(audioUrl, languageCode = "") {
  const body = { audio_url: audioUrl };
  const supportedLanguages = ["en", "fr", "fr-ca"];
  if (languageCode === "ht") {
    showToast("⚠️ Haitian Creole is not officially supported. Auto-detecting...");
  } else if (supportedLanguages.includes(languageCode)) {
    body.language_code = languageCode;
  }

  const res = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!data.id) throw new Error(data.error || "Transcription request failed.");
  return data.id;
}

async function checkTranscriptionStatus(id) {
  const res = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
    headers: { authorization: ASSEMBLYAI_API_KEY }
  });
  return await res.json();
}

async function startTranscription(audioUrl, languageCode) {
  const bar = document.getElementById("transcribeBar");
  const status = document.getElementById("transcribeStatusText");
  const percentText = document.getElementById("transcribePercent");

  try {
    const id = await transcribeAudio(audioUrl, languageCode);
    let percent = 10;
    let complete = false;

    while (!complete) {
      const res = await checkTranscriptionStatus(id);
      if (res.status === "completed") {
        editor.value = res.text;
        bar.style.width = "100%";
        bar.classList.add("success");
        status.textContent = "Transcription completed ✅";
        document.getElementById("exportSection").classList.remove("hidden");
      
        // Ensure audio is loaded and visible
        const audioUrlBlob = URL.createObjectURL(uploadedFile);
        audioPlayer.setAttribute("src", audioUrlBlob);
        audioPlayer.style.display = "block";         
        audioPlayer.classList.remove("hidden");    
        audioPlayer.controls = true;          
        audioPlayer.load();
      
        document.getElementById("audioControls").classList.remove("hidden");
        document.getElementById("shortcutHint").classList.remove("hidden");
      
        resetBtn.classList.remove("hidden");
        resetBtnTop.classList.remove("hidden");
      
        saveToHistory(uploadedFile.name, res.text);
        complete = true;
      } else if (res.status === "error") {
        bar.classList.add("error");
        status.textContent = "Transcription failed ❌";
        editor.value = "Transcription failed.";
        resetBtn.classList.remove("hidden");
        resetBtnTop.classList.remove("hidden");
        complete = true;
      } else {
        percent = Math.min(100, percent + 10);
        bar.style.width = percent + "%";
        percentText.textContent = percent + "%";
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  } catch (err) {
    console.error(err);
    status.textContent = "Transcription failed ❌";
    bar.classList.add("error");
  }
}

function saveToHistory(filename, text) {
  const history = JSON.parse(localStorage.getItem("transcription_history") || "[]");
  history.push({ date: new Date().toLocaleString(), filename, text });
  localStorage.setItem("transcription_history", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const list = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("transcription_history") || "[]");
  list.innerHTML = "";
  history.reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `[${entry.date}] ${entry.filename}`;
    li.addEventListener("click", () => {
      editor.value = entry.text;
    });
    list.appendChild(li);
  });
}
loadHistory();

// Audio skip buttons
document.getElementById("backBtn").addEventListener("click", () => {
  audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
});

document.getElementById("forwardBtn").addEventListener("click", () => {
  audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
});


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.setItem("sakpase_logged_in", "false");
  localStorage.removeItem("sakpase_user");
  window.location.href = "/index.html";
});

// Reset App
function resetApp() {
  editor.value = "";
  audioPlayer.src = "";
  audioPlayer.classList.add("hidden");
  document.getElementById("audioControls").classList.add("hidden");
  document.getElementById("shortcutHint").classList.add("hidden");
  uploadForm.classList.remove("hidden")

  document.getElementById("uploadBar").style.width = "0%";
  document.getElementById("uploadBar").classList.remove("success", "error");
  document.getElementById("uploadProgress").classList.add("hidden");

  document.getElementById("transcribeBar").style.width = "0%";
  document.getElementById("transcribeBar").classList.remove("success", "error");
  document.getElementById("transcribeProgress").classList.add("hidden");

  document.getElementById("exportSection").classList.add("hidden");
  fileInput.value = "";

  uploadContent.classList.remove("fade-out");
  uploadContent.classList.add("fade", "fade-in");

  uploadPreview.classList.add("hidden");
  fileName.textContent = "";
  fileSize.textContent = "";
  fileDuration.textContent = "";

  resetBtn.classList.add("hidden");
  resetBtnTop.classList.add("hidden");
  startTranscriptionBtn.disabled = false;
  startTranscriptionBtn.textContent = "Start Transcription"; // reset label
  startTranscriptionBtn.classList.remove("disabled");

}

resetBtn.addEventListener("click", () => {
  document.getElementById("confirmModal").classList.remove("hidden");
});

resetBtnTop.addEventListener("click", () => {
  document.getElementById("confirmModal").classList.remove("hidden");
});

document.getElementById("confirmYes").addEventListener("click", () => {
  document.getElementById("confirmModal").classList.add("hidden");
  resetApp();
});

document.getElementById("confirmNo").addEventListener("click", () => {
  document.getElementById("confirmModal").classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (document.activeElement.tagName.toLowerCase() === "textarea") return;

  if (e.key === "F1") {
    e.preventDefault();
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
  } else if (e.key === "F2") {
    e.preventDefault();
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
  }
});
