const getFieldName = name => `hud-status-${name?.toString()}`;
const getControlName = name => `hud-ctrl-${name?.toString()}`;
const getEmptyName = name => `hud-empty-${name?.toString()}`;

const createField = (id, label, value, color) => {
  return `<pre id="${id}" style="color:${color};margin:0px;">${label}${(value || 0).toString().padStart(3)}</pre>`;
};

const createControl = (id, label, cost, color) => {
  return `<div id=${id} style="display: flex; justify-content: space-between;">
  <span><button id="${id}-btn" data-cost=${cost} style="color:${color}; margin:-0.5em;" class="button">${label}</button></span>
  <span style="font-size: 0.5em; align-text: right; margin: 0.5em;"><p>Cost: ${cost}</p></span>
  </div>`;
};

const createEmptyControl = (id) => {
  return `<div id=${id} style="display: flex; justify-content: space-between;">
   <span style="font-size: 0.5em; align-text: left; margin: 0.5em;"><p> </p></span>
    <span style="font-size: 0.5em; align-text: right; margin: 0.5em;"><p> </p></span>
  </div>`;
};

const emptyLine = '<p></p>';

/**
 *
 */
export default class HeadsUpDisplay {
  constructor(game, hudId, hudStatusId, hudControlsId, messagesId) {
    this.game = game;
    this.hudId = hudId;
    this.statusId = hudStatusId;
    this.controlsId = hudControlsId;
    this.messagesId = messagesId;
    this.fields = {};
    this.controls = {};
    this.clearMessages();
  }

  hide() {
    document.getElementById(this.hudId).classList.add('hidden');
    document.getElementById(this.messagesId).classList.add('hidden');
  }

  reveal() {
    document.getElementById(this.hudId).classList.remove('hidden');
    document.getElementById(this.messagesId).classList.remove('hidden');
  }

  clearAll() {
    this.clearAllStatus();
    this.clearAllControl();
    this.clearMessages();
  }

  clearAllStatus() {
    let parent = document.getElementById(this.statusId);
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    this.fields = {};
  }

  clearAllControl() {
    let parent = document.getElementById(this.controlsId);
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  updateControls(available) {
    Object.getOwnPropertyNames(this.controls).forEach(controlId => {
      let ctrl = document.getElementById(controlId);
      let btn = ctrl?.querySelector('button');
      if (!btn) return;
      let cost = this.controls?.[controlId] || 0;
      btn.disabled = available < cost;
    });
  }

  getControlElement(name) {
    return document.getElementById(getControlName(name))?.querySelector('button');
  }

  /**
   * Set status with color determined by fraction of max, using array of colors for range
   * @param {string|{id: string, label: string}} name
   * @param {number} value
   * @param {number} maxValue
   * @param {string[] | string} colorArray
   */
  setStatusWithConditionColor(name, value, maxValue, colorArray) {
    let fraction = maxValue > 0 ? (value || 0) / maxValue : 0;
    let step = 1.0 / (colorArray.length - 1);
    let color = Array.isArray(colorArray) ? colorArray[Math.floor(fraction / step)] : colorArray;
    return this.setStatusField(name, `${value}/${maxValue}`, color);
  }

  /**
   *
   * @param {string|{id: string, label: string}} name
   * @param {string} value
   * @param {string} color
   */
  setStatusField(name, value, color) {
    // check for label 'id' vs explicit label type
    let labelText = name.id ? name.label : name;
    name = name.id || name.toString();

    // get parent text color if not specified
    if (!color) {
      color = document.getElementById(this.hudId).style.color;
    }
    const id = getFieldName(name);
    // exit early if value is same
    if (this.fields?.[id] == value) return;

    let ele = document.getElementById(id);
    if (!ele) {
      ele = document.createElement('div');
      let parent = document.getElementById(this.statusId);
      parent.appendChild(ele);
    }
    ele.outerHTML = createField(id, labelText, value, color);

    // set value for reference
    this.fields[id] = value;
  }

  addControl(name, cost, callback, color) {
    // get parent text color if not specified
    if (!color) {
      color = document.getElementById(this.hudId).style.color;
    }
    const id = getControlName(name);

    let eleControl = document.getElementById(id);

    if (!eleControl) {
      let wrapper = eleControl?.parentElement;
      if (!wrapper) {
        wrapper = document.createElement('div');
        let controlsParent = document.getElementById(this.controlsId);
        controlsParent.appendChild(wrapper);
      }
      wrapper.innerHTML = createControl(id, name, cost, color);
      eleControl = wrapper.firstChild;

      // set controls / costs
      this.controls[id] = cost;

      // set callback on button
      let btn = eleControl.querySelector('button');
      btn.onclick = callback;
      // avoid control buttons being triggered with space
      btn.onkeyup = e => e.preventDefault();
    }
  }

  addEmptyControl(name) {
    const id = getControlName(name);

    let eleControl = document.getElementById(id);

    if (!eleControl) {
      let wrapper = eleControl?.parentElement;
      if (!wrapper) {
        wrapper = document.createElement('div');
        let controlsParent = document.getElementById(this.controlsId);
        controlsParent.appendChild(wrapper);
      }
      wrapper.innerHTML = createEmptyControl(id);
      eleControl = wrapper.firstChild;

      // set controls / costs
      this.controls[id] = null;
    }
  }

  removeStatusField(name) {
    const id = getFieldName(name);
    if (this.fields[id] !== undefined) {
      delete this.fields[id];
    }
    const ele = document.getElementById(id);
    if (ele) {
      ele.remove();
    }
  }

  addEmptyStatus(name) {
    const id = getEmptyName(name);
    if (document.getElementById(id)) return;

    let ele = document.createElement('div');
    ele.id = id;
    ele.innerHTML = emptyLine;
    let parent = document.getElementById(this.statusId);
    parent.appendChild(ele);
  }

  writeMessage(message, showTurns = true) {
    const limit = 1000;
    if (this.messages.length > limit) {
      this.messages = this.messages.slice(limit / 2, this.messages.length - 1);
    }
    let prefix = showTurns ? `L${this.game.level} T${this.game.turnCount} ` : '';
    this.messages.push(prefix + message);
    let ele = document.getElementById(this.messagesId);
    let txt = Array.from(this.messages).reverse().join('\n');
    ele.innerHTML = txt;

    // scroll parent to top
    ele.parentElement.scrollTop = 0;
  }

  clearMessages() {
    this.messages = [];
    let ele = document.getElementById(this.messagesId);
    ele.innerHTML = '';
  }
}
