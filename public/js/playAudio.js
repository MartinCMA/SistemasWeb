
window.onload = function () {
    var boton = document.getElementById("playcopy");

    boton.onclick = async () => {
        try {
            const clipText = await navigator.clipboard.readText();
            const audioUrl = formatAudioUrl(clipText);
            await playAudio(audioUrl);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatAudioUrl = (originalUrl) => {
        return originalUrl.replace("/play", "").replace("localhost:3000", "");
    };

    const playAudio = async (audioUrl) => {
        try {
            const response = await fetch(audioUrl);
            const audioBlob = await response.blob();

            const audio = new Audio();
            const blobUrl = URL.createObjectURL(audioBlob);

            audio.src = blobUrl;
            audio.play();

            audio.addEventListener("ended", () => URL.revokeObjectURL(blobUrl));
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };
};
