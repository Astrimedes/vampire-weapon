import { lerp, easeOut, easeIn } from '../tools/mathutil.js';

const getValue = (value, defaultValue) => {
  return value === undefined || value === null ? defaultValue : value;
};

export default class Weapon {
  /**
     * Weapons
     * @param {Game} game
     * @param {Dungeon} map
     * @param {boolean} isPlayer
     * @param {object} options
     * @param {number} options.spriteNumber
     * @param {number} options.damage
     * @param {number} options.reach
     * @param {number} options.parry
     * @param {number} options.parryFrequency
     * @param {number} options.maxHp
     * @param {boolean} options.drawSprite
     *
     */
  constructor(game, map, options = {}, isPlayer = false) {
    this.game = game;
    this.map = map;

    this.drawColor = 'red';

    this.x = 0;
    this.y = 0;

    this.setFromTemplate(options);

    this.lastParryTurn = 0;

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

    /**
     * @type {import('../creatures/creature.js').default} wielder
     */
    this.wielder = null;
  }

  setFromTemplate(weaponType) {
    // damage dealt
    this.dmg = getValue(weaponType.damage, 1);

    // attack reach
    this.reach = getValue(weaponType.reach, 1);

    // parry
    this.parry = getValue(weaponType.parry, 0);

    // frequency of parry
    this.parryFrequency = getValue(weaponType.parryFrequency, 3);

    // add'l max hp granted to wielder creatures
    this.maxHp = getValue(weaponType.maxHp, 0);

    // sprite
    this.spriteNumber = getValue(weaponType.spriteNumber, 0);

    this.drawSprite = getValue(weaponType.drawSprite, false);
  }

  /**
   * Set wielder creature
   * @param {import('../creatures/creature').default} wielder
   */
  setWielder(wielder) {
    if (this.wielder && this.wielder != wielder) {
      this.wielder.unWield();
    }

    this.x = wielder.getDisplayX();
    this.y = wielder.getDisplayY();

    this.tile = wielder.tile;
    this.wielder = wielder;
  }

  /**
   *
   * @param {import('../creatures/creature.js').default} creature
   * @param {number} dx
   * @param {number} dy
   */
  attack(creature, dx, dy) {
    let dmg = Math.max(1, this.dmg + (this?.wielder?.strength || 0));
    let parryAmt = creature.hit(dmg, this);
    if (parryAmt) {
      // parry animation
      let animTarget = creature?.weapon?.drawSprite ? creature.weapon : creature;
      animTarget.beginAnimation(animTarget.x - (dx/2), animTarget.y - (dy/2), t => easeOut(easeIn(t)));
    }

    // animate self or creature - weapon.drawSprite flag
    let sprite = this.drawSprite ? this : this.wielder;
    sprite.beginAnimation(sprite.x - (dx / 2), sprite.y - (dy / 2));

    this.attacking = true;
    this.lastTarget = creature;

    this.writeAttackMessage(creature, dmg, parryAmt);
  }

  writeAttackMessage(targetCreature, dmg, parry = 0) {

    let attackerName = this.isPlayer ? 'you' : this.wielder.name;
    let defenderName = targetCreature.isPlayer ? 'you' : targetCreature.name;

    let toCap = text => text.charAt(0).toUpperCase() + text.slice(1);

    dmg = dmg - parry;
    if (dmg) {
      this.game.hud.writeMessage(`${toCap(attackerName)} attack${this.isPlayer ? '' : 's'} ${defenderName}, dealing ${dmg} damage!`);
    }
    if (parry) {
      this.game.hud.writeMessage(`${toCap(defenderName)} parr${targetCreature.isPlayer ? 'y' : 'ies'}, blocking ${!dmg ? 'ALL ' : ''}${parry} damage!`);
    }
  }

  tryAct() {
    if (!this.wielder) return false;
    return this.wielder.tryAct();
  }


  tick() {
    this.attacking = false;
    this.lastTarget = null;

    if (this?.wielder?.hp && !this.wielder.canParry) {
      this.wielder.canParry = (this.game.turnCount - this.lastParryTurn) >= this.parryFrequency;
      if (this.isPlayer && this.wielder.canParry && this.parry) {
        this.game.hud.writeMessage('You are ready to parry attacks!');
      }
    }
  }

  beginAnimation(xTarget, yTarget, interp = (t) => easeOut(easeIn(t)), duration = 170) {
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
    let fraction = Math.min(1,Math.max(0, animTime / this.animDuration));
    this.offsetX =  lerp(this.offsetX, 0, this.animInterp(fraction));
    this.offsetY = lerp(this.offsetY, 0, this.animInterp(fraction));

    let min = 0.005;

    if ((Math.abs(this.offsetX) + Math.abs(this.offsetY) < min) || fraction == 1) {
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
