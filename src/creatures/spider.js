import Creature from './creature.js';
import { Rng } from '../tools/randoms.js';
import { Sprite } from '../../assets/sprite-index.js';
import Fist from '../weapons/fist.js';

export default class Spider extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new Fist(game, map), options = {}) {
    super(game, map, tile, Sprite.Creature.spider, 12, weapon, {
      ignoreWalls: true,
      noticeRange: 8,
      controlResist: 0.75,
      strength: 1,
      agility: 2,
      ...options
    });
  }

  act() {
    if (this.isPlayer) return false;

    // ignore walls!
    let seekTiles = this.map.getAdjacentNeighbors(this.tile).filter(t => (!t.creature || t.creature.isPlayer) && this.map.inBounds(t.x, t.y));
    let lowDist = Infinity;
    let distA, distB;
    if (seekTiles.length) {
      seekTiles.sort((a,b) => {
        distA = this.map.dist(a, this.game.player.tile);
        distA += distA > 1 && + !a.passable ? -1 : 0;  // slightly favor wall tiles
        distB =  this.map.dist(b, this.game.player.tile);
        distB += distB > 1 && + !b.passable ? -1 : 0;  // slightly favor wall tiles
        let dist = distA - distB;
        lowDist = Math.min(distA, distB, lowDist);
        return dist;
      });
    }

    // if near player choose nearest tile, otherwise move randomly
    let idx = lowDist <= 10 ? 0 : Rng.inRange(0,seekTiles.length-1);
    this.tryMove(seekTiles[idx].x - this.x, seekTiles[idx].y - this.y);
  }
}
