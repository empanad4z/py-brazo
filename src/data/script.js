let input_message = document.getElementById("input-message")

input_message.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        console.log(`input: ${input_message.value}`);

        let val = parseFloat(input_message.value);
        
        if (isNaN(val)) {
            alert("Pon grados (en formato float) válido.");
            return;
        }

        sendMessage(val);
    }
});

function sendMessage(val) {
    // Creamos body en formato x-www-form-urlencoded
    let body = `data=${val}`;
    
    fetch("/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
    })
    .then(response => response.text())
    .then(text => console.log("ESP32 response:", text))
    .catch(err => console.error(err));
}
