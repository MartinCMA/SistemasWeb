function main() {
    const lblName = document.getElementById("name");
    const lblPass = document.getElementById("pass");
    const btnSubmit = document.getElementById("submit");
    const btnRegister = document.getElementById("register");

    // const handleResponse = (response) => {
    //     if (response.name === lblName.value) {
    //         window.location.href = "/main";
    //     } else {
    //         console.log('Usuario desconocido o ya existente');
    //         const text = document.createElement('span');
    //         text.innerText = response.message;
    //         document.body.appendChild(text);
    //     }
    // };

    // const sendRequest = (url, data) => {
    //     return fetch(url, {
    //         method: 'POST',
    //         redirect: 'follow',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(data)
    //     })
    //     .then(response => response.json())
    //     .then(handleResponse)
    //     .catch(error => console.error('Error:', error));
    // };

    btnSubmit.onclick = () => {
        console.log("Se pulsa el boton de lgin");
        fetch("/login", {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: lblName.value, pass: lblPass.value })
        }).then(r => r.json())
            .then(r=>{
                console.log("Martin llega:", r.name);
                if(r.name===lblName.value){
                    window.location.href = "/main" 
                }else{
                    console.log('Usuario desconocido');
                    const text = document.createElement('UD');
                    text.innerText='Usuario desconocido'
                    document.body.appendChild(text)
                } 
            }
        ).catch((error) => {
            console.log(error);
        })
    };

    btnRegister.onclick = () => {
        fetch("/register", {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: lblName.value, pass: lblPass.value })
        })
        .then(r => r.json())
        .then(r=>{
            if(r.name===lblName.value){
                window.location.href = "/main" 
            }else{
                console.log('Usuario ya existente');
                const text = document.createElement('UD');
                text.innerText='Usuario ya existente'
                document.body.appendChild(text)
            } 
        })
    };
}

window.onload = main;
