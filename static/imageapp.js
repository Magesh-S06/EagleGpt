const submitIcon = document.querySelector("#submit-icon")
const inputElement = document.querySelector("input")
const imageSection = document.querySelector('.images-section')

function clearInput(){
    imageSection.innerHTML='';
}

async function getImage(){
    console.log('clicked')
    const userInput= inputElement.value
    console.log(userInput)
    try {
         const response = await fetch("/generate-image",{
            method : 'POST',
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({prompt: userInput})
         });
         const data = await response.json()
         console.log(data)
         if (data.error){
            console.error(data)
            imageSection.textContent="Error:"+ data.error
         }
         else{
            data?.data.forEach(imageObject => {
                const imageContainer = document.createElement("div");
                imageContainer.classList.add("image-container");
                const imageElement = document.createElement("img");
                imageElement.setAttribute("src",imageObject.url);
                imageElement.addEventListener('click',()=>{
                    dowloadImage(imageObject.url)
                })
                imageContainer.append(imageElement);
                imageSection.append(imageContainer);
         });
        }
    } catch (error) {
        console.error(error)
    }
}

submitIcon.addEventListener('click', getImage)
submitIcon.addEventListener('click',clearInput)

document.querySelectorAll('.home-button').forEach(button => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        if (url) {
            window.location.href = url;
        }
    });
});


