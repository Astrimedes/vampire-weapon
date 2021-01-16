export default class Item {
  /**
   *
   * @param {object} options
   * @param {string} options.name
   * @param {number} options.spriteNumber
   * @param {string} options.message
   * @param {function(Item, import('../creatures/creature').default):boolean} options.effectFn function that takes (thisItem, affectedCreature) and returns true = consumed
   */
  constructor(options) {
    let { name, spriteNumber, message, effectFn } = { ...options };

    this.name = name;
    this.spriteNumber = spriteNumber;
    this.message = message;
    this.effectFn = effectFn || (() => { });

    /**
     * Tile
     * @type {import('../map/tile').Tile} tile
    */
    this.tile = null;
  }

  /**
   *
   * @param {import('../map/tile').Tile} tile
   */
  move(tile) {
    if (this.tile) {
      this.tile.removeItem(this);
    }

    this.tile = tile;
    tile.addItem(this);
  }

  remove() {
    if (this.tile) {
      this.tile.removeItem(this);
      this.tile = null;
    }
  }

  /**
   *
   * @param {import('../creatures/creature').default} creature creature that has stepped onto the item
   * @returns {boolean} whether item is removed or not
   */
  effect(creature) {
    return this.effectFn(this, creature);
  }
}
