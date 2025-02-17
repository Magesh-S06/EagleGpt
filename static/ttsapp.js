const submitButton = document.querySelector('#submit')
const outputelement = document.querySelector('#output')
const inputelement = document.querySelector('input')

// function changeInput(value){
//         const inputelement = document.querySelector('input')
//         inputelement.value = value
// }

async function getMessage() {
    console.log('clicked')
    const userInput=inputelement.value;
    console.log(userInput)


    try {
        const response = await fetch("/speech", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({input: userInput})
        });
        const data = await response.json()
        console.log(data)
        if (data.error) {
            console.error(data.error);
            outputelement.textContent = "Error:" + data.error;
        }else if(data.audio_url){
            console.log("Audio URL:", data.audio_url);
            outputelement.innerHTML=`
             <p class="preview-text">${userInput}:</p>
                <audio controls>
                    <source src="${data.audio_url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                `;
        }else {
            // console.log(data.output,2)
            outputelement.textContent = "Unexpected response format.";       
        } }catch(error){
                console.error(error);
                outputelement.textContent = "An error occured. Please try again.";
        }
}

submitButton.addEventListener('click',getMessage)

document.querySelectorAll('.home-button').forEach(button => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        if (url) {
            window.location.href = url;
        }
    });
});
