import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Weapon from '../weapons/weapon.js';

const addStun = creature => {
  creature.stunned += (creature.game.turnCount - creature.startTurn) % 4 == 0 ? 2 : 0;
};

const DMG = 2;

class SlowWeapon extends Weapon {
  constructor(game, map) {
    super(game, map, {
      spriteNumber: 0,
      parry: 1,
      reach: 1,
      damage: 3
    });
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
  constructor(game, map, tile, weapon = new SlowWeapon(game, map)) {
    super(game, map, tile, Sprite.Creature.slowguy, 7, weapon);
  }

  move(tile) {
    super.move(tile);
    addStun(this);
  }
}
