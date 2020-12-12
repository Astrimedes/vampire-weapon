
let INDEX = 0;

const NO_OP = () => { };

export class InputType {
  constructor(name, tileCallback = NO_OP, commandCallback = NO_OP) {
    this.id = INDEX++;
    this.name = name;
    this.tileAction = tileCallback;
    this.commandAction = commandCallback;
  }
}
