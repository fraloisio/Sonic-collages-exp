import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";

// Screen controls
const show = id => {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

// Elements
const fileInput = document.getElementById("file-input");
const btnGenerate = document.getElementById("btn-generate");
const audioPlayer = document.getElementById("audio-player");
const metadataLink = document.getElementById("metadata-link");
const errorMessage = document.getElementById("error-message");
const btnBack = document.getElementById("btn-back");
const btnErrorBack = document.getElementById("btn-error-back");

// Upload → Generate
btnGenerate.onclick = async () => {
  if (!fileInput.files.length) {
    alert("Please select an image first.");
    return;
  }

  show("screen-loading");

  try {
    const file = fileInput.files[0];

    const client = await Client.connect(HF_SPACE);

    // Run the pipeline
    const result = await client.predict("/pipeline_from_image", {
      image: file
    });

    const [audioUrl, metadataUrl] = result.data;

    // Populate success screen
    audioPlayer.src = audioUrl;
    metadataLink.href = metadataUrl;

    show("screen-success");

  } catch (err) {
    console.error(err);
    errorMessage.textContent =
      err?.message ||
      err?.title ||
      "Something went wrong. Please try again.";

    show("screen-error");
  }
};

btnBack.onclick = () => show("screen-upload");
btnErrorBack.onclick = () => show("screen-upload");
