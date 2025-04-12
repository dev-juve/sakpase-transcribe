const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;

const user = JSON.parse(localStorage.getItem("sakpase_user"));
// const wasLoggedIn = localStorage.getItem("sakpase_logged_in") === "true";

// Set the greeting text
if (user) {
  document.getElementById("greeting").textContent = `Welcome, ${user.username}!`;
}

// // Show welcome-back message only once right after login
// if (user && wasLoggedIn) {
//   const msg = document.createElement("div");
//   msg.textContent = `👋 Welcome back, ${user.username}!`;
//   msg.classList.add("welcome-back-message");

//   const main = document.querySelector("main");
//   main.insertBefore(msg, main.firstChild);

//   setTimeout(() => {
//     msg.classList.add("fade-out");
//   }, 2000);
// }

async function uploadAudio(file) {
  const response = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
    },
    body: file,
  });

  const data = await response.json();
  return data.upload_url;
}

async function transcribeAudio(audioUrl, languageCode = "") {
  const body = {
    audio_url: audioUrl,
  };

  if (languageCode) {
    body.language_code = languageCode;
  }

  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data.id;
}

async function checkTranscriptionStatus(id) {
  const response = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
    },
  });

  const data = await response.json();
  return data;
}

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = document.getElementById("audioInput").files[0];
  const output = document.getElementById("transcriptionEditor");
  const languageCode = document.getElementById("languageSelect").value;

  if (!file) {
    alert("Please select a file.");
    return;
  }

  output.value = "Uploading file...";

  try {
    const audioUrl = await uploadAudio(file);
    output.value = "File uploaded. Starting transcription...";

    const transcriptId = await transcribeAudio(audioUrl, languageCode);

    let completed = false;
    while (!completed) {
      const result = await checkTranscriptionStatus(transcriptId);

      if (result.status === "completed") {
        output.value = result.text;
        document.getElementById("exportSection").style.display = "block"; // 👈 Show export buttons
        completed = true;
        const history = JSON.parse(localStorage.getItem("transcription_history") || "[]");
        history.unshift({
            id: Date.now(),
            text: result.text,
            filename: file.name,
            date: new Date().toLocaleString(),
        });
        localStorage.setItem("transcription_history", JSON.stringify(history));

        completed = true;
      } else if (result.status === "error") {
        output.value = "Transcription failed.";
        completed = true;
      } else {
        output.value = `Transcribing... [${result.status}]`;
        await new Promise(res => setTimeout(res, 3000)); // wait 3s
      }
    }
  } catch (err) {
    console.error(err);
    output.value = "Error during transcription.";
  }
});

document.getElementById("exportTxtBtn").addEventListener("click", () => {
    const text = document.getElementById("transcriptionEditor").value;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
  
    link.href = URL.createObjectURL(blob);
    link.download = "transcription.txt";
    link.click();
  });

  document.getElementById("exportPdfBtn").addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const text = document.getElementById("transcriptionEditor").value;
  
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);
    pdf.text(lines, 10, 10);
    pdf.save("transcription.pdf");
  });

  document.getElementById("exportDocxBtn").addEventListener("click", async () => {
    const { Document, Packer, Paragraph, TextRun } = window.docx;
    const text = document.getElementById("transcriptionEditor").value;
  
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(text)],
          }),
        ],
      }],
    });
  
    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transcription.docx";
    link.click();
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
      localStorage.setItem("sakpase_logged_in", "false");
  
      // Redirect to login or homepage
      window.location.href = "/index.html";
    } else {
      // Do nothing, user stays logged in
      console.log("Logout canceled by user.");
    }
  });
  
  
  function loadHistory() {
    const list = document.getElementById("historyList");
    const history = JSON.parse(localStorage.getItem("transcription_history") || "[]");
  
    list.innerHTML = "";
  
    history.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `[${entry.date}] ${entry.filename}`;
      li.addEventListener("click", () => {
        document.getElementById("transcriptionEditor").value = entry.text;
      });
      list.appendChild(li);
    });
  }
  
  loadHistory();
  