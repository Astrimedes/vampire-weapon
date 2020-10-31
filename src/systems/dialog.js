const ID_DIALOG = 'dialog';
const ID_FORM = 'dlg-form';
const ID_MESSAGE = 'dlg-msg';
const ID_SUBMIT = 'btn-submit';
const ID_CANCEL = 'btn-cancel';
const ID_FIELDS = 'dlg-fields';

const DATA_FIELD = 'data';

const CLASS_HIDDEN = 'hidden';

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
  }

  getDialog () {
    return document.getElementById(ID_DIALOG);
  }

  reveal () {
    const dialog = this.getDialog();

    // build form
    this.setMessage(this.settings.message);
    this.setAbilities(this.settings.fields);
    this.setButtons(this.settings.submit, this.settings.cancel);

    // reveal
    document.getElementById(ID_MESSAGE).focus(); // avoid immediately clicking buttons etc
    dialog.classList.remove(CLASS_HIDDEN);
    this.open = true;
  }

  setMessage(message) {
    let node = document.getElementById(ID_MESSAGE);
    let lines = Array.isArray(message) ? message : [message];
    node.innerHTML = lines.map(m => `<p>${m}</p>`).join('\n');
  }

  setAbilities(available) {
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
        <label class="dlg-label" for="field-${i}">${a.name}: ${a.description} [${a.cost} blood]</label>
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
    submitBtn.onclick = handleSubmit;

    let cancelBtn = document.getElementById(ID_CANCEL);
    const handleCancel = e => {
      e.preventDefault();

      cancelFn(false);

      this.hide();
      return false;
    };
    cancelBtn.onclick = handleCancel;
  }

  hide () {
    this.getDialog().classList.add(CLASS_HIDDEN);
    this.open = false;
  }
}

export { Dialog };
