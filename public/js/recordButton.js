export function recordFn() {
  //debugger;
  const button = document.createElement('button');
  const icon = document.createElement('img');
  const label = document.createElement('span');
  
  icon.src = './images/record.svg';
  label.innerText = 'Grabar';
  
  button.appendChild(icon);
  button.appendChild(label);

  return button;
}