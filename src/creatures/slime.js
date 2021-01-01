import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Fist from '../weapons/fist.js';

const DMG = 2;

export default class Slime extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new Fist(game, map, DMG)) {
    super(game, map, tile, Sprite.Creature.slime, 4, weapon);
  }
}
