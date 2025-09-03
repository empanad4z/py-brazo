
const gateway = `ws://${window.location.hostname}/ws`;
let websocket;
// Init web socket when the page loads
window.addEventListener('load', onload);

let input_message = document.getElementById("input-message")

input_message.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        console.log(`input: ${input_message.value}`);

        let val = parseFloat(input_message.value);
        
        if (isNaN(val)) {
            alert("Pon grados (en formato float) válido.");
            return;
        }

        let buffer = new ArrayBuffer(4);
        new DataView(buffer).setFloat32(0, val, true); // true → little endian
        sendMessage(buffer);
    }
});

function sendMessage(buffer) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(buffer);
    }
}

function onload(event) {
    initWebSocket();
}

function initWebSocket() {
    console.log('Trying to open a WebSocket connection…');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

// When websocket is established, call the getReadings() function
function onOpen(event) {
    console.log('Connection opened');
    getReadings();
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

// Function that receives the message from the ESP32 with the readings
function onMessage(event) {
    console.log(event.data);

    if (event.data instanceof ArrayBuffer && event.data.byteLength === 4) {
        const steps = new DataView(event.data).getInt32(0, true);
        document.getElementById("response").innerHTML = steps;
    }
}