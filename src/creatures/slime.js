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
  constructor(game, map, tile, weapon = new Fist(game, map), options = {}) {
    super(game, map, tile, Sprite.Creature.slime, 9, weapon, {
      strength: 1,
      agility: 1,
      resistance: 1,
      controlResist: 0.2,
      name: 'Wyrmling',
      ...options
    });
  }
}
