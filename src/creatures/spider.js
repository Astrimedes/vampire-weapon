import Creature from './creature.js';
import { Rng } from '../tools/randoms.js';
import { Sprite } from '../../assets/sprite-index.js';

export default class Spider extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile) {
    super(game, map, tile, Sprite.Creature.spider, 1);
    //comment again
  }

  tryMove(dx, dy) {
    let newTile = this.map.getNeighbor(this.tile, dx, dy);
    if (!newTile.creature) {
      this.move(newTile);
      return true;
    } else if (newTile.creature && newTile.creature.isPlayer !== this.isPlayer) {
      this.attack(newTile.creature, dx, dy);
      return true;
    }
    return false;
  }

  act() {
    // ignore walls!
    let seekTiles = this.map.getAdjacentNeighbors(this.tile).filter(t => (!t.creature || t.creature.isPlayer) && this.map.inBoundsWall(t.x, t.y));
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
    console.log('spider low dist from player:', lowDist);
    this.tryMove(seekTiles[idx].x - this.x, seekTiles[idx].y - this.y);
  }
}