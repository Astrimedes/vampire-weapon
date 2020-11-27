const ID_DIALOG = 'dialog';
const ID_FORM = 'dlg-form';
const ID_MESSAGE = 'dlg-msg';
const ID_SUBMIT = 'btn-submit';
const ID_CANCEL = 'btn-cancel';
const ID_FIELDS = 'dlg-fields';
const ID_CANVAS = 'canvas';

const DATA_FIELD = 'data';

const CLASS_HIDDEN = 'hidden';
const CLASS_DIALOG = 'dialog';

const defaultSettings = {
  type: 'prompt',
  fields: [
    {label: 'One', value: 1},
    {label: 'Two', value: 2},
    {label: 'Three', value: 3}
  ],
  message: 'Choose one',
  submit: data => console.log('dialog data: ', data),
  cancel: () => console.log('cancelled')
};

const getFormData = form => {
  let data = new FormData(form);
  let formObj = {};
  for (let pair of data.entries()) {
    formObj[pair[0]] = pair[1];
  }
  return formObj;
};

class Dialog {
  constructor(settings = {}) {
    this.settings = Object.assign({}, defaultSettings, settings);
    this.open = !(this.getDialog()).classList.contains(CLASS_HIDDEN);

    let resize = window.onresize || (() => { });
    window.onresize = () => {
      resize();
      this.setPosition();
    };
  }

  getDialog () {
    return document.getElementById(ID_DIALOG);
  }

  setPosition() {
    const dialog = this.getDialog();
    // set position
    let rect = document.getElementById(ID_CANVAS).getBoundingClientRect();
    dialog.style.position = 'absolute';
    dialog.style.top = rect.top + 'px';
    dialog.style.left = rect.left + 'px';
    dialog.style.width = rect.width;
    dialog.style.height = rect.height;
  }

  reveal() {
    const dialog = this.getDialog();
    const { type, message, fields, player, submit, cancel } = this.settings;

    switch (type) {
    case 'abilities':
      this.setMessage(message);
      this.setAbilities(fields, player);
      this.setButtons(submit, cancel);
      break;
    case 'prompt':
      this.setMessage(message);
      this.setFields(fields);
      this.setButtons(submit, cancel);
      break;
    default:
      throw 'unimplemented dialog type';
    }

    this.open = true;

    // reveal
    const reveal = () => {
      // reset form values
      let form = document?.forms?.[0];
      if (form) form.reset();

      // adjust position
      this.setPosition(dialog);

      // show
      dialog.classList.remove(CLASS_HIDDEN);
      document.getElementById(ID_MESSAGE).focus(); // avoid immediately clicking buttons etc
    };
    this.revealTimeout = setTimeout(reveal, 1000 / 59); // delay a frame?
  }

  setMessage(message) {
    let node = document.getElementById(ID_MESSAGE);
    let lines = Array.isArray(message) ? message : [message];
    node.innerHTML = lines.map(m => `<p>${m}</p>`).join('\n');
  }

  setAbilities(available, player) {
    // get parent node
    let node = document.getElementById(ID_FIELDS);

    // clear it out
    node.innerHTML = '';

    // clear previous validation failures
    let form = document.getElementById(ID_FORM);
    form.reset();

    // create radio items
    let content = available.map((a, i ) => {
      return `
      <label for="field-${i}">
        <input type="radio" id="field-${i}" name="${DATA_FIELD}" value="${a.name}" required>
        <label class="dlg-label" for="field-${i}">${a.name}: ${a.description} [${a.getUpgradeCost(player)} blood]</label>
        <br></br>
      </label>
      `;
    })?.join('\n');
    // insert into dom
    node.innerHTML = content;
  }

  setFields(fields) {
    // get parent node
    let node = document.getElementById(ID_FIELDS);

    // clear it out
    node.innerHTML = '';

    // clear previous validation failures
    let form = document.getElementById(ID_FORM);
    form.reset();

    // create radio items
    let content = fields.map((f, i ) => {
      return `
      <label for="field-${i}">
        <input type="radio" id="field-${i}" name="${DATA_FIELD}" value="${f?.value || f}" required>
        <label for="field-${i}">${f?.label || f}</label>
        <br></br>
      </label>
      `;
    })?.join('\n');
    // insert into dom
    node.innerHTML = content;
  }

  setButtons(submitFn, cancelFn) {
    let submitBtn = document.getElementById(ID_SUBMIT);
    const handleSubmit = (e) => {
      e.preventDefault();
      let form = document.getElementById(ID_FORM);

      if (!form.checkValidity()) {
        return;
      }

      // callback
      let result = getFormData(form)?.[DATA_FIELD];
      submitFn(result);

      // close dialog
      this.hide();

      return false;
    };
    submitBtn.classList.add(CLASS_HIDDEN);
    submitBtn.onclick = handleSubmit;

    let cancelBtn = document.getElementById(ID_CANCEL);
    const handleCancel = e => {
      e.preventDefault();

      cancelFn(false);

      this.hide();
      return false;
    };
    cancelBtn.onclick = handleCancel;

    document.querySelectorAll(`.${CLASS_DIALOG} input[type="radio"]`).forEach((ele) => {
      console.log('found element', ele);
      ele.addEventListener('change', () => { document.getElementById(ID_SUBMIT).classList.remove(CLASS_HIDDEN); });
    });
  }

  hide() {
    this.getDialog().classList.add(CLASS_HIDDEN);
    this.open = false;
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = undefined;
    }
  }
}

export { Dialog };
