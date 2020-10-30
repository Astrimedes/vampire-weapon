import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Fist from '../weapons/fist.js';

export default class Slime extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new Fist(game, map)) {
    super(game, map, tile, Sprite.Creature.slime, 2, weapon);
  }
}