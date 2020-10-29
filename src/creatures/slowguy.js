import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Weapon from '../weapons/weapon.js';


const addStun = creature => {
  creature.stunned += creature.game.turnCount % 4 == 0 ? 2 : 0;
};

class SlowWeapon extends Weapon {
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
    super(game, map, tile, Sprite.Creature.chump, 3, weapon);
  }

  move(tile) {
    super.move(tile);
    addStun(this);
  }
}