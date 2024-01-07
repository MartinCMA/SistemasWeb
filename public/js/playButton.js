export function playFn() {
 const button = document.createElement('button');
  const icon = document.createElement('img');
  const label = document.createElement('span');
  
  icon.src = './images/play.svg';
  label.innerText = 'Reproducir';
  button.disabled = true;
  button.appendChild(icon);
  button.appendChild(label);
  
  return button;  
}
  