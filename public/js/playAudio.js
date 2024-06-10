
window.addEventListener('load', () => {
    const boton = document.querySelector("#playcopy");    
    boton.addEventListener('click', () => {
        navigator.clipboard.readText()
            .then(texto => texto.replace("/audio", "").replace("localhost:3000", ""))
            .then(url => fetch(url))
            .then(response => response.blob())
            .then(blob => {
                const audio = new Audio();
                const blobUrl = URL.createObjectURL(blob);
                audio.src = blobUrl;
                audio.play();
                audio.addEventListener('ended', () => URL.revokeObjectURL(blobUrl));
            });
    });
});
