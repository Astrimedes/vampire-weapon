import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Bolt from '../weapons/bolt.js';
import { Shop } from '../map/tile.js';
import { Rng } from '../tools/randoms.js';

export default class Witch extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new Bolt(game, map), options = {}) {
    super(game, map, tile, Sprite.Creature.witch, 1, weapon, {
      ignoreWalls: false,
      noticeRange: 4,
      controlResist: 0.75,
      strength: 0,
      agility: 2,
      ...options
    });
  }

  act() {
    if (this.isPlayer || this.hp <= 0) return false;

    // check distance to player
    let map = this.game.map;
    let dist = map.dist(this.tile, this.game.player.wielder.tile);

    // *** if player is too far, and this tile isnt' trapped, exit and 'wait' ***
    if (!this.tile.trapped && dist > 6 && Rng.inFloatRange(0, 1) < 0.75) {
      return true;
    }

    // find path to player
    const path = map.findPath(this.tile, this.game.player.wielder.tile);
    let tile = path[1];
    // if player is 1 square away, try choosing a tile not towards him...
    return this.tryMove(tile.x - this.x, tile.y - this.y);
  }

  die(silent) {
    let tile = this.tile;
    let game = this.game;

    // turn off visible corpse
    this.visible = false;
    super.die(silent);

    game.addSimpleParticles(24, tile.x, tile.y, { r: 50, g: 75, b: 150, a: 1 });
    game.map.replaceTile(tile, Shop);
  }
}
