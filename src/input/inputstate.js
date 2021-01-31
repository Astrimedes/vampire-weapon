let INDEX = 0;

export class InputType {
  /**
   *
   * @param {string} name
   * @param {function(import('../systems/game').default, import('../map/tile').Tile):void} tileCallback
   * @param {function(import('../systems/game').default, number):void} commandCallback
   */
  constructor(name, tileCallback, commandCallback) {
    this.id = INDEX++;
    this.name = name;


    this.original = {
      tile: tileCallback || (() => {}),
      command: commandCallback || (() => {})
    };

    this.reset();
  }

  reset() {
    /**
     * @type {function(import('../systems/game').default, import('../map/tile').Tile):void} tileCallback
     */
    this.tileAction = this.original.tile;
    /**
     * @type {function(import('../systems/game').default, number):void} commandCallback
     */
    this.commandAction = this.original.command;
  }
}
