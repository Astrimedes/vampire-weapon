// eslint-disable-next-line no-unused-vars
import { Sprite } from '../../assets/sprite-index.js';
// eslint-disable-next-line no-unused-vars
import Dungeon from '../map/map.js';
// eslint-disable-next-line no-unused-vars
import { Tile } from '../map/tile.js';
// eslint-disable-next-line no-unused-vars
import Game from '../systems/game.js';
// eslint-disable-next-line no-unused-vars
import { spike, lerp, easeOut, easeIn } from '../tools/mathutil.js';
import Weapon from './weapon.js';

const HIT_GAIN = 2;
const MOVE_COST = 1;
const JUMP_COST = 10;

export default class Player extends Weapon {
  /**
     *
     * @param {Game} map
     * @param {Dungeon} map
     * @param {Tile} tile
     * @param {number} spriteNumber
     * @param {number} hp
     */
  constructor(game, map) {
    super(game, map, Sprite.Creature.player, true);

    this.blood = 10;
  }

  attack(creature, dx, dy) {
    super.attack(creature, dx, dy);
    this.blood += HIT_GAIN;
  }

  jump(creature) {
    if (this.blood < JUMP_COST) return;
    this.blood -= JUMP_COST;
  }

  tryMove(dx, dy) {
    // can't move without wielder, or blood to spend
    if (!this.wielder || this.blood < MOVE_COST) {
      return false;
    }
    let moved = this.wielder.tryMove(dx, dy);
    this.blood -= moved ? MOVE_COST : 0;
    return !!moved;
  }

  die() {
    this.stopAnimation();
    if (!this.deathResolved) {
      this.stunned = 0;
      this.angry = 0;
      this.hp = 0;
      this.deathResolved = true;
      if (this.tile) this.tile.creature = null;
      this.tile = null;
      this.spriteNumber++; // corpse tile should be next tile...
    }
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

  getDisplayX() {
    return this.x + this.offsetX;
  }

  getDisplayY() {
    return this.y + this.offsetY;
  }

}
