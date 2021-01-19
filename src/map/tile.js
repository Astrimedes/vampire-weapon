import { Sprite } from '../../assets/sprite-index';
import { getTrapByName, isTrapActive } from '../config/traps';
import { Rng } from '../tools/randoms';

class Tile {
  /**
   *
   * @param {number} x tile x position
   * @param {number} y tile y position
   * @param {number} spriteNumber
   * @param {boolean} passable
   * @param {object} options
   * @param {boolean} options.trapped
   * @param {string} options.trapType
   */
  constructor(x, y, spriteNumber, passable, options) {
    this.x = x;
    this.y = y;

    this.type = '';

    this.spriteNumber = spriteNumber;

    this.passable = passable;

    this.trapped = options?.trapped || false;
    this.trapArmed = false;
    if (this.trapped) {
      this.trapType = options.trapType || 'spikes';
      this.trapTurnOffset = options.trapTurnOffset >= 0 ? options.trapTurnOffset : Rng.any([0, 3]);
    }

    this.creature = null;

    /**
     * @type {Array<Item>} items
     */
    this.items = [];
  }

  /**
   *
   * @param {import('../items/item').default} item
   */
  addItem(item) {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
  }

  /**
   *
   * @param {import('../items/item').default} item
   */
  removeItem(item) {
    let idx = this.items.indexOf(item);
    if (idx == -1) return;
    this.items.splice(idx, 1);
  }

  getTrap() {
    if (!this.trapped) return null;
    return getTrapByName(this.trapType);
  }

  /**
 *
 * @param {import('../creatures/creature').default} creature
 */
  stepOn(creature) {
    if (this.items.length) {
      // duplicate array to modify original while iterating
      Array.from(this.items).forEach((itm) => {
        itm.effect(creature) && this.removeItem(itm);
      });
    }
  }

  stayOn(creature) {
    if (this.trapped) {
      let trap = getTrapByName(this.trapType);
      if (trap && isTrapActive(trap, this, creature.game, creature.isPlayer)) {
        trap.effect(creature);
        if (!creature.hp) {
          // make blood
          creature.makeBlood(this.tile);
        }
      }
    }
  }
}

class Floor extends Tile {
  constructor(x, y, options) {
    super(x, y, Sprite.Map.floor, true, options);
    this.type = 'floor';
  }
}

class Wall extends Tile {
  constructor(x, y, options) {
    super(x, y, Sprite.Map.wall, false, options);
    this.type = 'wall';
  }
}

class Exit extends Tile {
  constructor(x, y, options) {
    super(x, y, Sprite.Map.exit, true, options);
    this.type = 'exit';
  }

  stepOn(creature) {
    super.stepOn(creature);
    if (creature.isPlayer && !creature.stunned) {
      let game = creature.game;
      game.callDialog({
        message: 'Enter the portal?',
        submit: () => {
          game.setGameState(game.lastGameState);
          game.exit();
        },
        cancel: () => {
          game.setGameState(game.lastGameState);
        },
        type: 'prompt'
      });
    }
  }
}

class Shop extends Tile {
  constructor(x, y, options) {
    super(x, y, Sprite.Map.shop, true, options);
    this.type = 'shop';
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.spriteNumber = Sprite.Map.floor;
  }

  stepOn(creature) {
    super.stepOn(creature);
    if (this.active && creature.isPlayer && !creature.stunned) {
      creature.game.callAbilityDialog();
    }
  }
}

export { Tile, Floor, Wall, Exit, Shop };
