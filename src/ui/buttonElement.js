const NO_OP = () => {};

function getMousePos(canvas, evt) {
  let rect = this.canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
    y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
  };
}

/**
 *
 * @param {string} buttonId
 * @param {HTMLCanvasElement} canvas
 * @param {number} fractionX
 * @param {number} fractionY
 */
function spawnButton(buttonId, canvas, fractionX, fractionY) {
  let button = document.createElement('button');
  button.setAttribute('id', buttonId);
  button.innerText = 'PUSH ME';
  setButtonPosition(button, canvas, fractionX, fractionY);
  document.body.appendChild(button);

  let resize = window.onresize || NO_OP;
  window.onresize = () => {
    resize();
    setButtonPosition(button, canvas, fractionX, fractionY);
  };
}

function setButtonPosition(button, canvas, fractionX, fractionY) {
  let rect = canvas.getBoundingClientRect();
  button.style.display = 'inline';
  button.style.position = 'absolute';
  button.style.top = rect.top + (fractionY * rect.height) + 'px';
  button.style.left = rect.left + (fractionX * rect.width) +  'px';
}

export { spawnButton, getMousePos };
