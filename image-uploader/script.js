let client;

async function initClient() {
    client = await window.gradioClient.Client.connect(
        "Hope-and-Despair/Stable-Audio-freestyle-new-experiments"
    );
}

initClient();

document.getElementById("generateBtn").addEventListener("click", async () => {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return alert("Please upload an image.");

    switchScreen("upload-screen", "loading-screen");

    try {
        const result = await client.predict(
            "/pipeline_from_image",
            { image: file }
        );

        // Expect audio output in result object
        console.log(result);

        const audioUrl = result?.data?.[0]?.url || result?.audio || null;

        if (!audioUrl) throw new Error("No audio returned");

        const player = document.getElementById("audioPlayer");
        player.src = audioUrl;

        document.getElementById("statusMessage").innerHTML =
            "Your image has been transferred to the Global Bubbles Space.<br>Its echoes are now part of the archive.";

        switchScreen("loading-screen", "result-screen");

    } catch (err) {
        console.error(err);
        switchScreen("loading-screen", "error-screen");
    }
});


function switchScreen(from, to) {
    document.getElementById(from).classList.remove("active");
    document.getElementById(to).classList.add("active");
}

function resetApp() {
    switchScreen("result-screen", "upload-screen");
    switchScreen("error-screen", "upload-screen");
}
