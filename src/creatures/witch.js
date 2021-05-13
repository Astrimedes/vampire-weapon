import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Bolt from '../weapons/bolt.js';
import {Rng} from '../tools/randoms';
import { Shop } from '../map/tile.js';

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
    if (this.isPlayer) return false;

    // chase player
    let seekTiles = this.map.getAdjacentNeighbors(this.tile).filter(t => ((!t.passable && t?.creature?.isPlayer) || (t.passable && !t.creature)) && this.map.inBounds(t.x, t.y));
    this.map.get;
    let distA, distB;
    if (seekTiles.length) {
      let playerTile = this.game.player.tile;
      seekTiles.sort((a,b) => {
        distA = this.map.dist(a, playerTile);
        distB = this.map.dist(b, playerTile);

        if (distA == 0) return -1;
        if (distB == 0) return 1;

        let aAligned =  distA <= distB && (a.x == playerTile.x || a.y == playerTile.y);
        let bAligned =  distB <= distA && (b.x == playerTile.x || b.y == playerTile.y);

        return (aAligned && !bAligned) ? -1 : (bAligned && !aAligned) ? 1 : Math.sign(distA - distB);
      });

      // choose best tile most of the time
      let tile = seekTiles[0];
      this.tryMove(tile.x - this.x, tile.y - this.y);
    }
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
