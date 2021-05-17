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
  constructor(game, map, tile, weapon = new Fist(game, map), options) {
    super(game, map, tile, Sprite.Creature.chump, 6, weapon, {
      agility: 1,
      strength: 1,
      name: 'Little Knight',
      controlResist: 0,
      ...options
    });
    // start very afraid
    this.fear = 100;
  }

  tick() {
    // always a little scared?
    this.fear = Math.max(this.fear, 15);
    super.tick();
  }
}
