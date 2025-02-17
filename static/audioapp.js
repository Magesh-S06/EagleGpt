const submitButton = document.querySelector('#submit');
const outputelement = document.querySelector('#output');
const inputelement = document.querySelector('input');

async function getMessage(){
    console.log('clicked');
    const userInput = inputelement.value;
    console.log(userInput)

    try{
        const response = await fetch("/audio",{
            method : 'POST',
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({input: userInput})
        });
        const data = await response.json();
        console.log(data);
        if(data.error){
            console.error(data.error);
            outputelement.textContent = "Error:"+ data.error;
        }else if (data.audio_gen_url){
            outputelement.innerHTML=`<p></p>
            <audio controls>
            <source src="${data.audio_gen_url}" type="audio/mp3">
            </audio>
            `;
        }else{
            outputelement.textContent = "Unexpected response format.";
        } }catch(error){
            console.error(error);
            outputelement.textContent="An error occured. Please try again.";
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