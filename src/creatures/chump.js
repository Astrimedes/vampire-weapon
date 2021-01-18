import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Fist from '../weapons/fist.js';

export default class Chump extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new Fist(game, map), options = {}) {
    super(game, map, tile, Sprite.Creature.chump, 7, weapon, {
      agility: 1,
      ...options
    });
    this.allowedAttack = false;
  }

  tick() {
    this.allowedAttack = this.allowedAttack || this.playerHit;
    super.tick();
  }
}
