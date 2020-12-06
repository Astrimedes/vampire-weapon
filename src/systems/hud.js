const getFieldName = name => `hud-status-${name?.toString()}`;
const getControlName = name => `hud-ctrl-${name?.toString()}`;
const getEmptyName = name => `hud-empty-${name?.toString()}`;

const stringToColour = str => {
  switch (str) {
  case 'Fire':
    return 'orange';
  case 'Bleed':
    return 'red';
  case 'Ice':
    return 'cornflowerblue';
  case 'Size':
    return 'gold';
  }
};

const createField = (id, label, value, color) => {
  return `<pre id="${id}" style="color:${color};margin:0px">${label}${(value || 0).toString().padStart(3)}</pre>`;
};

const createButton = (id, label, color) => {
  return `<button id=${id} style="color:${color};" class="button">${label}</button>`;
};

const emptyLine = '<p></p>';

/**
 *
 */
export default class HeadsUpDisplay {
  constructor(hudId, hudStatusId, hudControlsId, messagesId) {
    this.hudId = hudId;
    this.statusId = hudStatusId;
    this.controlsId = hudControlsId;
    this.messagesId = messagesId;
    this.fields = {};
    this.messages = [];
  }

  hide() {
    document.getElementById(this.hudId).classList.add('hidden');
  }

  reveal() {
    document.getElementById(this.hudId).classList.remove('hidden');
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

  setStatusField(name, value, color) {
    // get parent text color if not specified
    if (!color) {
      color = document.getElementById(this.hudId).style.color;
    } else {
      color = stringToColour(name);
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
    ele.outerHTML = createField(id, name, value, color);

    // set value for reference
    this.fields[id] = value;
  }

  addControl(name, callback, color) {
    // get parent text color if not specified
    if (!color) {
      color = document.getElementById(this.hudId).style.color;
    }
    const id = getControlName(name);

    let btn = document.getElementById(id);
    let wrapper = btn ? btn.parentElement : null;
    if (!wrapper) {
      wrapper = document.createElement('div');
      let controlsParent = document.getElementById(this.controlsId);
      controlsParent.appendChild(wrapper);
    }
    wrapper.innerHTML = createButton(id, name, color);
    btn = wrapper.firstChild;

    // set callback
    btn.onclick = callback;
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

  writeMessage(message) {
    this.messages.push(message);
    let ele = document.getElementById(this.messagesId);
    let txt = message;
    if (this.messages.length > 1) {
      txt = Array.from(this.messages).reverse().slice(0, 3).join('\n');
    }
    ele.innerHTML = txt;
  }

  clearMessages() {
    this.messages = [];
    let ele = document.getElementById(this.messagesId);
    ele.innerHTML = '';
  }
}
