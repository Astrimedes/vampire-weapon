// eslint-disable-next-line no-unused-vars
import Dungeon from '../map/map.js';
// eslint-disable-next-line no-unused-vars
import { Tile } from '../map/tile.js';
// eslint-disable-next-line no-unused-vars
import Game from '../systems/game.js';
import { spike, lerp, easeOut, easeIn } from '../tools/mathutil.js';

export default class Weapon {
  /**
     *
     * @param {Game} map
     * @param {Dungeon} map
     * @param {Tile} tile
     * @param {number} spriteNumber
     * @param {number} hp
     */
  constructor(game, map, spriteNumber, reach = 1, isPlayer = false) {
    this.game = game;
    this.map = map;
    this.spriteNumber = spriteNumber;

    this.drawColor = 'red';

    this.x = 0;
    this.y = 0;

    this.reach = reach; // attack reach

    // set these after move to prevent any initial animation
    this.offsetX = 0;
    this.offsetY = 0;
    this.animating = false;
    this.animStart = null;
    this.animDuration = 0;

    this.dead = false;
    this.deathResolved = false;

    this.isPlayer = isPlayer;
  }

  setWielder(wielder) {
    if (this.wielder && this.wielder != wielder) {
      this.wielder.unWield();
    }

    this.x = wielder.getDisplayX();
    this.y = wielder.getDisplayY();

    this.tile = wielder.tile;
    this.wielder = wielder;
  }

  attack(creature, dx, dy) {
    creature.hit(1);
    this.animating = true;
    this.beginAnimation(this.x - (dx/2), this.y - (dy/2), t => spike(t));
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
    return this.x + (Math.sign(this.wielder.lastMoveX) * this.wielder.offsetWpnX) + this.offsetX;
  }

  getDisplayY() {
    return this.y + (Math.sign(this.wielder.lastMoveY) * this.wielder.offsetWpnY) + this.offsetY;
  }

  die() {
    // drop weapon 'corpse' nearby
  }

}
