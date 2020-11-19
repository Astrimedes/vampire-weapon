const getFieldName = name => `hud-status-${name}`;

const createField = (id, label, value) => {
  return `<div id="${id}">${label}: ${(value || 0).toString()}</div>`;
};

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

  setStatusField(name, value) {
    const id = getFieldName(name);
    // exit early if value is same
    if (this.fields?.[id] == value) return;

    let ele = document.getElementById(id);
    if (!ele) {
      ele = document.createElement('div');
      let parent = document.getElementById(this.statusId);
      parent.appendChild(ele);
    }
    ele.outerHTML = createField(id, name, value);

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
}
