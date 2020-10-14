import { Sprite } from '../../assets/sprite-index.js';
import Creature from './creature.js';

export default class Blob extends Creature {
  constructor(game, map, tile, spawns = 1) {
    super(game, map, tile, Sprite.Creature.slime, 1);
    this.spawns = spawns;
  }

  die() {
    if (this.spawns > 0) {
      this.spawns--;
      let neighbors = this.map.getAdjacentPassableNeighbors(this.tile).filter(t => !t.creature);
      if (neighbors.length) {
        // add a new blob!
        this.game.addMonster(new Blob(this.game, this.map, neighbors[0], this.spawns));
      }
    }

    super.die();
  }
}