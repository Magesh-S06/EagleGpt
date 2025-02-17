const transcribeButton = document.querySelector('#transcribeButton');
const outputelement = document.querySelector('#result');
const audioPreview = document.querySelector('#audioPreview');

function handleFileSelection(event) {
    const audioInput = event.target;
    const audioFile = audioInput.files[0];
    console.log(audioFile.type)
    console.log(audioFile.name)

    if (!audioFile) {
        audioPreview.innerHTML = "<p>No audio file selected.</p>";
        return;
    }

    const audioURL = URL.createObjectURL(audioFile);
    audioPreview.innerHTML = `
        <p>Preview:</p>
        <audio controls>
            <source src="${audioURL}" type="${audioFile.type}">
            Your browser does not support the audio element.
        </audio>
    `;
}
async function transcribeAudio() {
    console.log('Transcribe button clicked');
    outputelement.innerHTML='';
    const formData = new FormData();
    const audioInput = document.querySelector('#audioFile'); // File input field
    const audioFile = audioInput.files[0];

    if (!audioFile) {
        outputelement.textContent = "Please select an audio file first.";
        return;
    }

    formData.append("audio", audioFile);

    try {
        const response = await fetch("/transcribe", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            outputelement.textContent = "Error: " + data.error;
        } else if (data.transcription) {
            outputelement.innerHTML = `<p>Transcription: ${data.transcription}</p>`;
        } else {
            outputelement.textContent = "Unexpected response format.";
        }
    } catch (error) {
        console.error(error);
        outputelement.textContent = "An error occurred. Please try again.";
    }
}
const audioInput = document.querySelector('#audioFile');
audioInput.addEventListener('change', handleFileSelection);
transcribeButton.addEventListener('click', transcribeAudio);

document.querySelectorAll('.home-button').forEach(button => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        if (url) {
            window.location.href = url;
        }
    });
});


