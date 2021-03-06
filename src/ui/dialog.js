const ID_DIALOG = 'dialog';
const ID_FORM = 'dlg-form';
const ID_MESSAGE = 'dlg-msg';
const ID_SUBMIT = 'btn-submit';
const ID_CANCEL = 'btn-cancel';
const ID_FIELDS = 'dlg-fields';

const ID_SHADE = 'dialog-bg-shade';

const DATA_FIELD = 'data';

const CLASS_HIDDEN = 'hidden';
const CLASS_DIALOG = 'dialog';

const Z = 100;

const defaultSettings = {
  type: 'prompt',
  fields: [],
  message: '',
  submit: null,
  cancel: null
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
  /**
   * create the dialog with given settings
   * @param {{type: string, fields: Array, message: string, submit: function, cancel: function}} settings
   */
  constructor(settings = {}) {
    this.settings = Object.assign({}, defaultSettings, settings);
    this.open = !(this.getDialog()).classList.contains(CLASS_HIDDEN);

    let resize = window.onresize || (() => { });
    window.onresize = () => {
      resize();
    };
  }

  getDialog () {
    return document.getElementById(ID_DIALOG);
  }

  showShade() {
    let shade = document.getElementById(ID_SHADE);
    if (!shade) {
      shade = document.createElement('div');
      shade.style.position = 'absolute';
      shade.style.top = 0;
      shade.style.left = 0;
      shade.style.width = '100vw';
      shade.style.height = '100vh';
      shade.id = ID_SHADE;

      shade.style.backgroundColor =  'rgba(0, 0, 0, 0.65)';

      shade.style.zIndex = Z - 1;

      document.body.appendChild(shade);
    }
    shade.style.display = 'inline';
  }

  hideShade() {
    let shade = document.getElementById(ID_SHADE);
    if (shade) {
      shade.style.display = 'none';
    }
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
      this.showShade();

      // reset form values
      let form = document?.forms?.[0];
      if (form) form.reset();

      // show
      dialog.classList.remove(CLASS_HIDDEN);
      // highlight first option if present, or ok button
      let selected = document.getElementById(ID_SUBMIT);
      selected.focus();

      // scroll to top
      dialog.scrollTop = 0;
    };
    this.revealTimeout = setTimeout(reveal, 20); // slight delay
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

    const health = (player?.wielder?.hp || 0);

    // create radio items
    let content = available.map((a, i) => {
      let disabled = (a.cost > (health - 1)) ? 'disabled' : '';
      let style = disabled ? 'color: darkgray;' : '';
      return `
      <label style="${style}" for="field-${i}">
        <input type="radio" id="field-${i}" name="${DATA_FIELD}" value="${a.name}" required ${disabled} class="${disabled ? CLASS_HIDDEN : ''}">
        <label class="dlg-label" for="field-${i}">${a.name}: ${a.description}</label>
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
    submitBtn.classList.add(CLASS_HIDDEN);
    if (submitFn) {
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
      submitBtn.classList.remove(CLASS_HIDDEN);
      submitBtn.onclick = handleSubmit;
      submitBtn.disabled = false;

      // add disabled if any fields are present
      let radios = document.querySelectorAll(`.${CLASS_DIALOG} input[type="radio"]`);
      if (radios.length) {
        submitBtn.disabled = true;
        radios.forEach((ele) => {
          ele.addEventListener('change', () => { document.getElementById(ID_SUBMIT).disabled = false; });
        });
      }
    }

    let cancelBtn = document.getElementById(ID_CANCEL);
    cancelBtn.classList.add(CLASS_HIDDEN);
    if (cancelFn) {
      const handleCancel = e => {
        e.preventDefault();

        cancelFn(false);

        this.hide();
        return false;
      };
      cancelBtn.classList.remove(CLASS_HIDDEN);
      cancelBtn.onclick = handleCancel;
    }
  }

  hide() {
    this.getDialog().classList.add(CLASS_HIDDEN);
    this.open = false;
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = undefined;
    }
    this.hideShade();
  }
}

export { Dialog };
