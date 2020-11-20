const getFieldName = name => `hud-status-${name}`;
const getEmptyName = name => `hud-empty-${name}`;

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
  return `<div id="${id}" style="color:${color};">${label}: ${(value || 0).toString()}</div>`;
};

const emptyLine = '<p></p>';

/**
 *
 */
export default class HeadsUpDisplay {
  constructor(hudId, hudStatusId, hudControlsId) {
    this.hudId = hudId;
    this.statusId = hudStatusId;
    this.controlsId = hudControlsId;
    this.fields = {};
  }

  hide() {
    document.getElementById(this.hudId).classList.add('hidden');
  }

  reveal() {
    document.getElementById(this.hudId).classList.remove('hidden');
  }

  clearAllStatus() {
    let parent = document.getElementById(this.statusId);
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    this.fields = {};
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

  addEmpty(name) {
    const id = getEmptyName(name);
    if (document.getElementById(id)) return;

    let ele = document.createElement('div');
    ele.id = id;
    ele.innerHTML = emptyLine;
    let parent = document.getElementById(this.statusId);
    parent.appendChild(ele);
  }
}
