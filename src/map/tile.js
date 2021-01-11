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
  }

  getTrap() {
    if (!this.trapped) return null;
    return getTrapByName(this.trapType);
  }

  stepOn(creature) {
    if (!this.trapped) return;
    let trap = getTrapByName(this.trapType);
    if (trap && isTrapActive(trap, this, creature.game, creature.isPlayer)) {
      trap.effect(creature);
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
    if (creature.isPlayer) {
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
  }

  stepOn(creature) {
    if (creature.isPlayer) {
      creature.game.callAbilityDialog();
    }
  }
}

export { Tile, Floor, Wall, Exit, Shop };
