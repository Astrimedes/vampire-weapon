import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Fist from '../weapons/fist';
import weaponTypes from '../config/weaponTypes';

const addStun = creature => {
  creature.stunned += (creature.game.turnCount - creature.startTurn) % 4 == 0 ? 2 : 0;
};

class SlowWeapon extends Fist {
  constructor(game, map) {
    super(game, map, weaponTypes[0].damage, weaponTypes[0].damage - 1);
  }

  attack(creature, dx, dy) {
    super.attack(creature, dx, dy);
    addStun(this.wielder);
  }
}

export default class SlowGuy extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new SlowWeapon(game, map), options = {}) {
    super(game, map, tile, Sprite.Creature.slowguy, 18, weapon, {
      strength: 2,
      agility: -1,
      ...options
    });
  }

  move(tile) {
    super.move(tile);
    addStun(this);
  }
}
