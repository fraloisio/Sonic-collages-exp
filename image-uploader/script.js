import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------
  // Fake mode toggle
  // ----------------------------------------------
  const FAKE_MODE = false;
  const FAKE_AUDIO = "fake/fake-audio.mp3";
  const FAKE_METADATA = "fake/fake-metadata.txt";

  // ----------------------------------------------
  // DOM references
  // ----------------------------------------------
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

  // ----------------------------------------------
  // Screen switching helper
  // ----------------------------------------------
  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  // ----------------------------------------------
  // Convert Gradio output → usable URL
  // ----------------------------------------------
  function toUrl(x) {
    if (!x) return "";

    if (typeof x === "string") return x;
    if (x.url && typeof x.url === "string") return x.url;
    if (x.path && typeof x.path === "string") return x.path;
    if (x.name && typeof x.name === "string") return x.name;

    if (x.data instanceof Blob) return URL.createObjectURL(x.data);
    if (x.data?.url) return x.data.url;
    if (x.data?.path) return x.data.path;

    return "";
  }

  // ----------------------------------------------
  // MAIN: Generate Audio
  // ----------------------------------------------
  btnGenerate.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    show(screenLoading);

    if (FAKE_MODE) return runFakeMode(file);

    try {
      const client = await Client.connect(
        "Hope-and-Despair/Stable-Audio-freestyle-new-experiments"
      );

   const job = await client.submit(
  "/pipeline_from_image",
  { image: file },
  null   // optional event handler
);

// subscribe to events
for await (const event of job) {
  if (event.type === "status") {
    console.log("STATUS:", event.stage, event.message);

    if (event.queue_position !== undefined) {
      loadingText.textContent = `In queue… position ${event.queue_position}`;
    }
  }

  if (event.type === "progress") {
    console.log("PROGRESS:", event);
    loadingText.textContent = `Generating… ${Math.round(event.progress * 100)}%`;
  }

    if (event.type === "data") {
      const [audioResult, metadataResult] = event.data;
      const audioUrl = toUrl(audioResult);
      const metadataUrl = toUrl(metadataResult);

      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = audioUrl;
      audioPlayer.load();
      metadataLink.href = metadataUrl;

      show(screenSuccess);
    }};

      if (!result || !result.data || result.data.length < 2) {
        console.error("BAD RESULT:", result);
        throw new Error("Invalid response from server.");
      }

      const audioUrl = toUrl(result.data[0]);
      const metadataUrl = toUrl(result.data[1]);

      if (!audioUrl || !metadataUrl) {
        console.error("BAD URL PARSE:", result);
        throw new Error("Missing audio or metadata.");
      }

      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = audioUrl;
      audioPlayer.load();
      metadataLink.href = metadataUrl;

      show(screenSuccess);

    } catch (err) {
      console.error("GENERATION ERROR:", err);
      errorMessage.textContent =
        err?.message || "Something went wrong. Try again.";
      show(screenError);
    }
  });

  // ----------------------------------------------
  // FAKE MODE
  // ----------------------------------------------
  async function runFakeMode(file) {
    await new Promise((r) => setTimeout(r, 800));

    outputImage.src = URL.createObjectURL(file);
    audioPlayer.src = FAKE_AUDIO;
    metadataLink.href = FAKE_METADATA;

    show(screenSuccess);
  }

  // ----------------------------------------------
  // BACK BUTTONS
  // ----------------------------------------------
  function resetUi() {
    outputImage.src = "";
    audioPlayer.src = "";
    metadataLink.removeAttribute("href");
    fileInput.value = "";
    errorMessage.textContent = "";
  }

  btnBack.addEventListener("click", () => {
    resetUi();
    show(screenUpload);
  });

  btnErrorBack.addEventListener("click", () => {
    resetUi();
    show(screenUpload);
  });

});
