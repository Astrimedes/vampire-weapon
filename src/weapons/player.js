import { Sprite } from '../../assets/sprite-index.js';
import { lerp, easeOut, easeIn } from '../tools/mathutil.js';
import Weapon from './weapon.js';

const HIT_GAIN = 2;
const JUMP_COST = 10;

export default class Player extends Weapon {
  /**
     *
     * @param {Game} game
     * @param {Dungeon} map
     * @param {{reach: string, effects: []}} playerConfig
     */
  constructor(game, map, playerConfig = {}) {
    super(game, map, Sprite.Weapon.sword, playerConfig?.reach || 1, true, playerConfig?.effects || [], 'whitesmoke', true);
    this.isPlayer = true;
    this.blood = playerConfig?.blood || 0;
  }

  tryAct() {
    // do nothing
  }

  tryMove(dx, dy) {
    if (this.wielder) {
      if (this.wielder.stunned) {
        // if wielder is stunned we can't move
        return true;
      }
      if (this.wielder.tryMove(dx, dy)) {
        return true;
      }
    }
    return false;
  }

  attack(creature, dx, dy) {
    super.attack(creature, dx, dy);
    this.blood += HIT_GAIN;
    creature.playerHit = 2;
  }

  jump(creature) {
    if (this.blood < JUMP_COST) return;
    this.blood -= JUMP_COST;
    if (creature.wield(this)) {
      this.setWielder(creature);
    }
  }

  // tryMove(dx, dy) {
  //   // can't move without wielder, or blood to spend
  //   if (!this.wielder || this.blood < MOVE_COST) {
  //     return false;
  //   }
  //   let moved = this.wielder.tryMove(dx, dy);
  //   this.blood -= moved ? MOVE_COST : 0;
  //   return !!moved;
  // }

  die() {
    this.stopAnimation();
    this.game.endGame();
  }

  beginAnimation(xTarget, yTarget, interp = (t) => easeOut(easeIn(t)), duration = 150) {
    this.animating = true;
    this.offsetX = this.x - xTarget;
    this.offsetY = this.y - yTarget;
    // set this for proper first frame logic
    this.animStart = null;
    this.animDuration = duration;
    this.animInterp = interp;
  }

  stopAnimation() {
    this.animating = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.animStart = null;
    this.animDuration = 0;
  }

  animate() {
    if (!this.animating) return false;

    // first frame
    if (this.animStart == null) {
      this.animStart = this.game.time;
    }

    // elapsed animation time
    let animTime = this.game.time - this.animStart;
    let fraction = animTime / this.animDuration;
    this.offsetX =  lerp(this.offsetX, 0, this.animInterp(fraction));
    this.offsetY =  lerp(this.offsetY, 0, this.animInterp(fraction));

    let min = 0.005;

    if (Math.abs(this.offsetX) + Math.abs(this.offsetY) < min) {
      this.stopAnimation();
    }
    return true;
  }

}
