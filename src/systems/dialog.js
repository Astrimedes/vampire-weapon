const ID_DIALOG = 'dialog';
const CLASS_HIDDEN = 'hidden';
const DATA_RESPONSE = 'response';

const defaultSubmit = (data) => {
  console.log('submitted:', data);
};

class Dialog {
  constructor (settings = { type: 'prompt', options: [1, 2, 3], submit: () => { console.log(); } }) {
    this.type = settings.type;
    this.open = !(this.getDialog()).classList.contains(CLASS_HIDDEN);

    // settings.options.forEach(o => {

    // })
  }

  getDialog () {
    return document.getElementById(ID_DIALOG);
  }

  reveal () {
    const dialog = this.getDialog();
    if (dialog.classList.contains(CLASS_HIDDEN)) {
      dialog.classList.remove(CLASS_HIDDEN);

      // set custom data value of user response...
      dialog.dataset[DATA_RESPONSE] = 'no';
    }
    this.open = true;
  }

  hide () {
    this.getDialog().classList.add(CLASS_HIDDEN);

    this.open = false;
  }
}

export { Dialog };
