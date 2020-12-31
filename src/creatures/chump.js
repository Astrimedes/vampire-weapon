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
  constructor(game, map, tile, weapon = new Fist(game, map)) {
    super(game, map, tile, Sprite.Creature.chump, 5, weapon);
    this.allowedAttack = false;
  }
}
