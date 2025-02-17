const submitButton = document.querySelector('#submit');
const inputElement = document.querySelector('textarea');
const chatContainer = document.querySelector('.chat-container');
const historyElement = document.querySelector('.history');
const newChatButton = document.querySelector('#new-chat');

let chatHistory = [];
let currentChat = [];

function createMessageElement(content, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user' : 'bot');
    if (!isUser) {
        messageDiv.innerHTML = content; 
    } else {
        messageDiv.textContent = content; 
    }
    return messageDiv;
}

function addMessageToChat(content, isUser = true) {
    const messageElement = createMessageElement(content, isUser);
    chatContainer.appendChild(messageElement);

    messageElement.classList.add('slide-in');
    setTimeout(() => {
        messageElement.classList.add('visible');
    }, 50);

    chatContainer.scrollTop = chatContainer.scrollHeight; 
}

function displayChat(messages){
    chatContainer.innerHTML='';
    messages.forEach((message) => {
        const messageElement = createMessageElement(message.content, message.isUser);
        chatContainer.appendChild(messageElement)
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveChat(){
    if (currentChat.length > 0){
        const chatName = `${currentChat[0].content}`;
        chatHistory.push({name : chatName, messages: [...currentChat]});
        const chatButton = document.createElement('p');
        chatButton.textContent = chatName;
        chatButton.addEventListener('click', () => {
            displayChat(chatHistory.find(chat => chat.name == chatName).messages)
        });
        historyElement.appendChild(chatButton);

        currentChat=[];
    }
}

async function getMessage() {
    console.log('clicked');
    const userInput = inputElement.value;
    console.log(userInput);
    if (!userInput.trim()) return;

    currentChat.push({ content: userInput, isUser: true});
    addMessageToChat(userInput, true); 
    inputElement.value = '';
    
    try{
        const response = await fetch("/reason", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({input: userInput})
        });
        const data = await response.json();
        if (data.error){
            console.error(data.error);
            currentChat.push({content: `Error: ${data.error}`, isUser: false});
            addMessageToChat(`Error: ${data.error}`, false); 
        } else {
            const botMessage = marked.parse(data.output)
            currentChat.push({ content: botMessage, isUser: false });
            addMessageToChat(botMessage, false);
        }
    } catch (error){
        console.error(error);
        currentChat.push({ content: "An error occurred. Please try again.", isUser: false });
    }
}

submitButton.addEventListener('click', getMessage);

newChatButton.addEventListener('click', () => {
    saveChat(); 
    chatContainer.innerHTML = ''; 
    currentChat = []; 
});

document.querySelectorAll('.home-button').forEach(button => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        if (url) {
            window.location.href = url;
        }
    });
});
