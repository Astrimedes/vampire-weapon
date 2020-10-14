import Creature from './creature.js';
import { Rng } from '../tools/randoms.js';
import { Sprite } from '../../assets/sprite-index.js';

export default class SlowGuy extends Creature {
  /**
   *
   * @param {Game} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile) {
    super(game, map, tile, Sprite.Creature.slowguy, 3);
  }

  tryAct() {
    if (super.tryAct()) {
      // angry means he doesn't get stunned after moving
      this.stunned = this.angry ? 0 : Math.max(this.stunned + 1, 1);
      // decrease angry count
      this.angry = Math.max(this.angry - 1, 0);
    }
  }

  act() {
    // decide...
    let seekTiles = this.map.getAdjacentPassableNeighbors(this.tile).filter(t => !t.creature || t.creature.isPlayer);
    let lowDist = Infinity;
    let distA, distB;
    if (seekTiles.length) {
      seekTiles.sort((a,b) => {
        distA = this.map.dist(a, this.game.player.tile);
        distB =  this.map.dist(b, this.game.player.tile);
        let dist = distA - distB;
        lowDist = Math.min(distA, distB, lowDist);
        return dist;
      });
    }
    // if next to player or 'angry', then seek player, otherwise move randomly
    let idx = lowDist <= 2 || this.angry ? 0 : Rng.inRange(0,seekTiles.length-1);
    this.tryMove(seekTiles[idx].x - this.x, seekTiles[idx].y - this.y);
  }

  hit(dmg) {
    super.hit(dmg);
    this.angry = 3; // get angry for 3 turns whenever hit
  }
}