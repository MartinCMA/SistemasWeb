export function uploadFn() {
    const button = document.createElement('button');
    const icon = document.createElement('img');
    const label = document.createElement('span');
    
    icon.src = './images/record.svg';
    label.innerText = 'Subir';
    
    button.appendChild(icon);
    button.appendChild(label);

    return button;
}