import { lerp, easeOut, easeIn } from '../tools/mathutil.js';

export default class Weapon {
  /**
     * Weapons
     * @param {Game} game
     * @param {Dungeon} map
     * @param {number} spriteNumber
     * @param {number} reach
     * @param {boolean} isPlayer
     * @param {string} drawColor
     */
  constructor(game, map, spriteNumber, reach = 1, dmg = 1, isPlayer = false, drawColor = 'maroon', drawSprite = false) {
    this.game = game;
    this.map = map;
    this.spriteNumber = spriteNumber;

    this.drawColor = drawColor;
    this.drawSprite = drawSprite;

    this.x = 0;
    this.y = 0;

    // damage dealt
    this.dmg = dmg;

    // attack reach
    this.reach = reach;

    // set these after move to prevent any initial animation
    this.offsetX = 0;
    this.offsetY = 0;
    this.animating = false;
    this.animStart = null;
    this.animDuration = 0;

    this.dead = false;
    this.deathResolved = false;

    // will initialize to defaults
    this.tick();

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
    creature.hit(this.dmg);

    // animate self or creature - weapon.drawSprite flag
    let sprite = this.drawSprite ? this : this.wielder;
    sprite.beginAnimation(sprite.x - (dx / 2), sprite.y - (dy / 2));

    this.attacking = true;
    this.lastTarget = creature;

    this.game.hud.writeMessage(this.getAttackMessage(creature));
  }

  getAttackMessage(targetCreature) {
    if (this.isPlayer) {
      return `You attack the ${targetCreature.name}!`;
    }
    if (targetCreature.isPlayer) {
      return `${this.wielder.name} attacks you!`;
    }
    return `${this.name} attacks ${targetCreature.name}!`;
  }


  tick() {
    this.attacking = false;
    this.lastTarget = null;
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
    this.offsetY = lerp(this.offsetY, 0, this.animInterp(fraction));

    if (this.isPlayer) {
      console.log('offsetX', this.offsetX);
      console.log('offsetY', this.offsetY);
      console.log('animTime', animTime);
      console.log('animFraction', fraction);
    }

    let min = 0.005;

    if ((Math.abs(this.offsetX) + Math.abs(this.offsetY) < min) || animTime > this.animDuration) {
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
