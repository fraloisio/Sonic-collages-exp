import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  const FAKE_MODE = false; // toggle ON/OFF

  const FAKE_AUDIO = "fake/fake-audio.mp3";
  const FAKE_METADATA = "fake/fake-metadata.txt";

  const screenUpload = document.getElementById("screen-upload");
  const screenLoading = document.getElementById("screen-loading");
  const screenSuccess = document.getElementById("screen-success");
  const screenError = document.getElementById("screen-error");

  const fileInput = document.getElementById("file-input");
  const btnGenerate = document.getElementById("btn-generate");
  const btnBack = document.getElementById("btn-back");
  const btnErrorBack = document.getElementById("btn-error-back");

  const audioPlayer = document.getElementById("audio-player");
  const metadataLink = document.getElementById("metadata-link");
  const outputImage = document.getElementById("output-image");
  const errorMessage = document.getElementById("error-message");

  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  btnGenerate.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
      alert("Upload an image first");
      return;
    }

    show(screenLoading);

    if (FAKE_MODE) {
      return runFakeMode(file);
    }

    try {
      const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";
      const client = await Client.connect(HF_SPACE);

      // Upload safely without reading .size
      const formData = { image: file };

      let result;
      try {
        result = await client.predict("/pipeline_from_image", formData);
      } catch (uploadErr) {
        console.error("UPLOAD FAILED:", uploadErr);
        throw new Error("Upload failed. Try another image.");
      }

      if (!result || !result.data || result.data.length < 2) {
        console.error("BAD RESULT:", result);
        throw new Error(result?.message || "Server returned invalid response.");
      }

      const [audioUrl, metadataUrl] = result.data;

      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = audioUrl;
      metadataLink.href = metadataUrl;

      show(screenSuccess);

    } catch (err) {
      console.error("GENERATION ERROR:", err);
      errorMessage.textContent = err?.message || "Something failed. Try again.";
      show(screenError);
    }
  });

  async function runFakeMode(file) {
    await new Promise((res) => setTimeout(res, 800));

    outputImage.src = URL.createObjectURL(file);
    audioPlayer.src = FAKE_AUDIO;
    metadataLink.href = FAKE_METADATA;

    show(screenSuccess);
  }

  btnBack.addEventListener("click", () => {
    outputImage.src = "";
    show(screenUpload);
  });

  btnErrorBack.addEventListener("click", () => {
    outputImage.src = "";
    show(screenUpload);
  });
});
