import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------
  // FAKE MODE TOGGLE SYSTEM (synced both screens)
  // ----------------------------------------------
  let FAKE_MODE = localStorage.getItem("FAKE_MODE") === "true";

  const toggle1 = document.getElementById("fake-toggle");
  const toggle2 = document.getElementById("fake-toggle-2");

  toggle1.checked = FAKE_MODE;
  toggle2.checked = FAKE_MODE;

  function syncFakeMode(value) {
    FAKE_MODE = value;
    localStorage.setItem("FAKE_MODE", value);
    toggle1.checked = value;
    toggle2.checked = value;
  }

  toggle1.addEventListener("change", () => syncFakeMode(toggle1.checked));
  toggle2.addEventListener("change", () => syncFakeMode(toggle2.checked));

  const FAKE_AUDIO = "fake/fake-audio.mp3";
  const FAKE_METADATA = "fake/fake-metadata.txt";

  // ----------------------------------------------
  // DOM
  // ----------------------------------------------
  const Supload = document.getElementById("screen-upload");
  const Sload = document.getElementById("screen-loading");
  const Ssuccess = document.getElementById("screen-success");
  const Serror = document.getElementById("screen-error");

  const fileInput = document.getElementById("file-input");

  const btnGenerate = document.getElementById("btn-generate");
  const btnBack = document.getElementById("btn-back");
  const btnErrorBack = document.getElementById("btn-error-back");

  const audioPlayer = document.getElementById("audio-player");
  const metadataLink = document.getElementById("metadata-link");
  const outputImage = document.getElementById("output-image");
  const titleText = document.getElementById("title-text");
  const errorMessage = document.getElementById("error-message");

  // ----------------------------------------------
  function show(screen) {
    [Supload, Sload, Ssuccess, Serror].forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  function toUrl(x) {
    if (!x) return "";
    if (typeof x === "string") return x;
    if (x.url) return x.url;
    if (x.path) return x.path;
    if (x.name) return x.name;
    if (x.data instanceof Blob) return URL.createObjectURL(x.data);
    if (x.data?.url) return x.data.url;
    if (x.data?.path) return x.data.path;
    return "";
  }

  function getFilename(file) {
    if (!file?.name) return "Untitled";
    return file.name.replace(/\.[^/.]+$/, "");
  }

  // ----------------------------------------------
  // Generate (REAL + FAKE)
  // ----------------------------------------------
  btnGenerate.addEventListener("click", async () => {

    if (!fileInput.files.length) {
      alert("Please upload an image first.");
      return;
    }

    show(Sload);

    const file = fileInput.files[0];

    // Fake
    if (FAKE_MODE) return runFake(file);

    // Real
    try {
      const client = await Client.connect("Hope-and-Despair/Stable-Audio-freestyle-new-experiments");
      const uploaded = await client.upload(file);
      const result = await client.predict("/pipeline_from_image", { image: uploaded });

      const [audioRes, metaRes] = result.data;

      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = toUrl(audioRes);
      metadataLink.href = toUrl(metaRes);
      titleText.textContent = getFilename(file);

      show(Ssuccess);

    } catch (err) {
      console.error(err);
      errorMessage.textContent = err?.message || "Something went wrong.";
      show(Serror);
    }
  });

  // Fake generation
  async function runFake(file) {
    await new Promise(r => setTimeout(r, 400));

    outputImage.src = URL.createObjectURL(file);
    audioPlayer.src = FAKE_AUDIO;
    metadataLink.href = FAKE_METADATA;
    titleText.textContent = getFilename(file);

    show(Ssuccess);
  }

  // Reset
  function reset() {
    outputImage.src = "";
    audioPlayer.src = "";
    audioPlayer.load();
    metadataLink.href = "";
    titleText.textContent = "";
    errorMessage.textContent = "";
    fileInput.value = "";
  }

  btnBack.addEventListener("click", () => { reset(); show(Supload); });
  btnErrorBack.addEventListener("click", () => { reset(); show(Supload); });
});
