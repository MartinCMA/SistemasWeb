function main() {
    const lblName = document.getElementById("name");
    const lblPass = document.getElementById("pass");
    const btnSubmit = document.getElementById("submit");
    const btnRegister = document.getElementById("register");

    const handleResponse = (response) => {
        if (response.name === lblName.value) {
            window.location.href = "/main";
        } else {
            console.log('Usuario desconocido o ya existente');
            const text = document.createElement('span');
            text.innerText = response.message;
            document.body.appendChild(text);
        }
    };

    const sendRequest = (url, data) => {
        return fetch(url, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(handleResponse)
        .catch(error => console.error('Error:', error));
    };

    btnSubmit.onclick = () => {
        sendRequest("/login", { name: lblName.value, pass: lblPass.value });
    };

    btnRegister.onclick = () => {
        sendRequest("/register", { name: lblName.value, pass: lblPass.value });
    };
}

window.onload = main;
