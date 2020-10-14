import { Sprite } from '../../assets/sprite-index.js';
import Creature from './creature.js';

export default class Player extends Creature {
  constructor(game, map, tile, hp = 3){
    super(game, map, tile, Sprite.Creature.player, hp);
    this.isPlayer = true;
    this.stunned = 0; // player doesn't have immediate stunning
  }

  tryMove(dx, dy){
    if (this.dead) return;
    if(super.tryMove(dx,dy)) {
      this.game.tick();
    }
  }

  act() {
    if (this.dead) {
      this.game.endGame();
    }
  }
}
