import BloodItem from '../items/all/blood.js';
import { lerp, easeOut, easeIn } from '../tools/mathutil.js';
import Fist from '../weapons/fist.js';

let ID = 0;

export default class Creature {
  /**
     *
     * @param {import('../systems/game').default} game
     * @param {Dungeon} map
     * @param {Tile} tile
     * @param {number} spriteNumber
     * @param {number} hp
     * @param {import('../weapons/weapon').default} weapon
     * @param {object} options
     * @param {string} options.name
     * @param {boolean} options.ignoreWalls
     * @param {number} options.strength
     * @param {number} options.agility
     * @param {number} options.resistance
     * @param {number} options.bloodAmt blood reward - default = hp/2
     * @param {boolean} options.beginAwake creatures normally begin sleeping (default = false)
     * @param {number} options.noticeRange tile range where sleeping creatures will wake (default = 3)
     * @param {number} options.currentHp starting hp vs. max hp
     */
  constructor(game, map, tile, spriteNumber, hp, weapon, options = {}) {
    this.game = game;
    this.map = map;
    /**
     * @type {import('../map/tile').Tile} tile
     */
    this.tile = null;
    this.move(tile);
    this.spriteNumber = spriteNumber;
    this.hp = options?.currentHp || hp;
    this.maxHp = hp;

    // start 'sleeping' by default
    this.asleep = !weapon?.isPlayer || !options.beginAwake;
    this.noticeRange = options.noticeRange || 2;

    // copy stats
    this.strength = options.strength || 0;
    this.agility = options.agility || 0;
    this.resistance = options.resistance || 0;
    this.bloodAmt = options.bloodAmt || Math.floor(hp / 2);

    this.curses = [];

    this.allowedAttack = true;

    // set these after move to prevent any initial animation
    this.offsetX = 0;
    this.offsetY = 0;
    this.animating = false;
    this.animStart = null;
    this.animDuration = 0;

    this.lastMoveX = 1;
    this.lastMoveY = 0;

    this.offsetWpnX = 5/16;
    this.offsetWpnY = 5/16;

    this.dead = false;
    this.deathResolved = false;

    this.attacking = false;

    this.stunned = 0;

    this.id = ID++;

    this.spawnTurn = this.game.turnCount;

    this.playerHit = false;

    // movement abilities
    this.ignoreWalls = options.ignoreWalls || false;
    this.isSmart = false;

    this.startTurn = this.game.turnCount;

    // parry normally controlled by weapon or defend action
    this.defending = false;
    this.canParry = true;

    this.name = options.name || this.constructor.name;

    // 'special moves' from abilities etc
    this.specials = [];

    /**
     * @type {number} 0-1 scale of player control when player charms
     */
    this.control = 0;

    /**
     * @type {number} 0-1 scale of resistance against charm
     */
    this.controlResist = options.controlResist || 0;

    this.wield(weapon);

    // save enemy weapon to restore if player leaves
    if (!weapon.isPlayer) {
      this.baseWeapon = weapon;
    }

    console.log(`created ${this.name} creature hp: ${this.hp} / ${this.maxHp}`);
  }

  isStunned() {
    return this.stunned > 1 || this.isPlayer && this.stunned;
  }

  defend() {
    this.defending = true;
  }

  tryMove(dx, dy) {
    // first check movement - 1 square
    let newTile = this.map.getNeighbor(this.tile, dx, dy);
    let moveTile = (this.ignoreWalls || newTile.passable) && this.map.inBounds(newTile.x, newTile.y) && !newTile.creature ? newTile : null;
    if (moveTile && this?.weapon?.reach == 1) {
      this.move(moveTile);
      return true;
    }

    // attack adjacent
    if (this.weapon && newTile.creature && newTile.creature.isPlayer !== this.isPlayer) {
      this.weapon.attack(newTile.creature, dx, dy);
      this.lastMoveX = dx;
      this.lastMoveY = dy;
      return true;
    }

    // bump against wall and return
    if ((!this.ignoreWalls && !newTile.passable) && (!newTile.creature || newTile.creature.isPlayer === this.isPlayer)) {
      // animation to bump against wrong direction...
      this.beginAnimation(this.x - (dx / 4), this.y - (dy / 4));
      return false;
    }

    if (this?.weapon?.reach < 2) {
      return false;
    }
    let proceed = newTile.passable;

    // check attack - weapon reach
    let reachX = dx;
    let reachY = dy;
    while (proceed && (Math.abs(reachX) < this.weapon.reach && Math.abs(reachY) < this.weapon.reach)) {
      reachX += Math.sign(dx);
      reachY += Math.sign(dy);
      newTile = this.map.getNeighbor(this.tile, reachX, reachY);
      if (newTile.creature && newTile.creature.isPlayer !== this.isPlayer) {
        this.weapon.attack(newTile.creature, reachX, reachY);
        this.lastMoveX = dx;
        this.lastMoveY = dy;
        return true;
      }
      if (!newTile.passable || newTile.creature) {
        break;
      }
    }

    if (this.weapon && newTile.creature && (newTile.creature.isPlayer !== this.isPlayer)) {
      this.weapon.attack(newTile.creature, newTile.x - this.x, newTile.y - this.y);
      return true;
    }

    if (moveTile && !moveTile.creature) {
      this.move(moveTile);
      return true;
    }

    return false;
  }

  /**
   *
   * @param {object} charmObject
   * @param {number} charmObject.power
   * @param {{name: string, effect: function}} charmObject.curse
   */
  charm(charmObject) {
    // apply charm
    this.control += Math.max(0.1, charmObject.power - this.controlResist);

    // apply curse to self
    charmObject.curse.effect(this);
    this.game.hud.writeMessage(`${this.isPlayer ? 'You' : 'The ' + this.name} is cursed with ${charmObject.curse.name}!`);
    // add to list of curse applied
    this.curses = this.curses || [];
    this.curses.push({ ...charmObject.curse });

    // return indicator of complete control
    return this.control >= 1;
  }

  hit(dmg, attacker) {
    let parry = 0;
    if ((this?.weapon?.parry && this.canParry) || this.defending) {
      let weaponParry = Math.max(Math.floor((this.weapon.parry || 0) / 2), 1);
      parry = Math.floor(Math.min(dmg, this.defending ? weaponParry + Math.max(1, weaponParry / 2) : weaponParry));
    }

    // reset parry turn
    this.weapon.lastParryTurn = this.game.turnCount + (this.isPlayer ? 0 : 1);
    this.canParry = false;

    this.hp -= dmg - parry;
    this.dead = this.hp <= 0;

    this.playerKilled = attacker?.isPlayer || false;

    return parry;
  }

  die(silent = false) {
    this.stopAnimation();
    this.dieSilent = this.dieSilent || silent;
    if (!this.deathResolved) {
      if (!this.dieSilent) {
        // write message
        let msg = this.isPlayer ? 'You die!' : `${this.name} is destroyed!`;
        this.game.hud.writeMessage(msg);

        this.makeBlood(this.game.map.getAdjacentPassableNeighbors(this.tile).find(t => !t.creature));
      }

      this.stunned = 0;
      this.hp = 0;
      this.deathResolved = true;
      if (this.tile && this.tile.creature == this) this.tile.creature = null;
      this.tile = null;
      this.spriteNumber++; // corpse tile should be next tile...

      // destroy weapon
      if (this.isPlayer && this.weapon) {
        this.weapon.die();
      }
      this.unWield();
    }
  }

  /**
   *
   * @param {import('../map/tile').Tile} tile
   */
  makeBlood(tile) {
    // leave blood
    if (this.bloodAmt && tile) {
      let blood = new BloodItem(this.bloodAmt);
      tile.addItem(blood);
    }
  }

  beginAnimation(xTarget, yTarget, interp = (t) => easeOut(easeIn(t)), duration = 170) {
    this.animating = true;
    this.offsetX = this.x - xTarget;
    this.offsetY = this.y - yTarget;
    if (this.weapon) {
      this.weapon.x = this.getDisplayX();
      this.weapon.y = this.getDisplayY();
    }
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

    if (this.weapon) {
      this.weapon.x = this.getDisplayX();
      this.weapon.y = this.getDisplayY();
    }
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

    this.weapon.x = this.getDisplayX();
    this.weapon.y = this.getDisplayY();

    let min = 0.005;

    if ((Math.abs(this.offsetX) + Math.abs(this.offsetY) < min) || fraction == 1) {
      this.stopAnimation();
    }
    return true;
  }

  /**
   *
   * @param {import('../weapons/weapon').default | import('../weapons/player').default} weapon
   */
  wield(weapon) {
    // hold original weapons
    // if (this.weapon && this.weapon !== weapon && !this.weapon.isPlayer) {
    //   this.lastWeapon = this.weapon;
    //   this.unWield();
    // }
    /**
     * @type {import('../weapons/weapon').default | import('../weapons/player').default} weapon
     */
    this.weapon = weapon;

    weapon.setWielder(this);

    // this.maxHp += weapon.maxHp;

    this.isPlayer = !!weapon.isPlayer;
    if (!this.dead && this.isPlayer) {
      this.stunned = 0; // reset stun
      this.asleep = false; // remove asleep
      this.allowedAttack = true; // player always allowed attack

      // set player control
      this.control = 1;


      // remove self from monster list, assign to playerBody
      let idx = this.game.monsters.findIndex(m => m == this);
      if (idx !== -1) {
        this.game.monsters.splice(idx, 1);
      }
    }

    return true;
  }

  unWield() {
    if (this.isPlayer) {
      this.control = 0;
    }

    this.isPlayer = false;
    if (!this.weapon) return;

    // reset hp
    // this.maxHp = Math.max(1, this.maxHp - (this.weapon.maxHp || 0));
    if (this.hp && !this.dead) {
      // this.hp = Math.max(1, this.hp - (this.weapon.maxHp || 0));

      // wield last (original?) weapon
      this.wield(new Fist(this.game, this.game.map));
    }
  }

  /**
   *
   * @param {Tile} tile
   */
  move(tile) {
    if (tile?.creature?.alive) {
      let dx = tile.x - this.tile.x;
      let dy = tile.y - this.tile.y;
      // attack
      if (this.weapon && tile.creature.isPlayer !== this.isPlayer) {
        return this.weapon.attack(tile.creature, dx, dy);
      }
      // try to move the other direction?
      if (this.tryMove(-dx, -dy)) {
        return true;
      }
      // give up
      return false;
    }

    this.lastMoveX = tile.x - this.x;
    this.lastMoveY = tile.y - this.y;

    if (this.tile && !this.tile.isSameTile(tile)) {
      this.tile.creature = null;
      this.beginAnimation(tile.x, tile.y);
    }

    this.tile = tile;
    tile.creature = this;
    // set x & y from tile
    this.x = tile.x;
    this.y = tile.y;

    if (this.weapon) {
      this.weapon.tile = tile;
    }

    tile.stepOn(this);
  }

  getDisplayX() {
    return this.x + this.offsetX;
  }

  getDisplayY() {
    return this.y + this.offsetY;
  }

  // check for waking...
  tryWake() {
    if (this.asleep && !this?.game?.player?.wielder?.dead) {
      // check for any non-sleeping, non-stunned monster in range - add player
      let wakers = Array.from(this.game.monsters);
      wakers.push(this.game?.player?.wielder);
      let waker = wakers.find(m => m && !m.dead && !m.asleep && (m.isPlayer || m.stunned <= 0) && this.game.map.diagDist(this.tile, m.tile) <= this.noticeRange);
      if (waker) {
        this.wake();
        return true;
      }
    }
    return false;
  }

  tryAct() {
    if (this.dead) return false;

    // die if necessary
    if (this.hp <= 0) {
      this.dead = true;
      return false;
    }

    this.tryWake();
    if (this.asleep) return false;

    let acted = false;

    // trigger act
    if (this.stunned <= 0) {
      this.act();
      acted = true;
    }

    if (this.tile) {
      this.tile.stayOn(this);
    }

    // otherwise finish without acting
    return acted;
  }

  wake(stunTurns = 1) {
    let name = this.isPlayer ? 'You' : 'The ' + this.name;
    let verb = this.isPlayer ? 'are' : 'is';
    this.game.hud.writeMessage(`${name} ${verb} awake!`);
    this.asleep = false;
    this.stunned = this.stunned || this.stunned + (this.startTurn % 2 == 0 ? stunTurns + 1 : stunTurns);
  }

  tick() {
    if (this.hp <= 0) {
      this.die();
    }
    // reduce status durations after first turn passes
    if (this.game.turnCount <= this.spawnTurn) {
      return;
    }
    this.stunned = Math.max(this.stunned - 1, 0);

    if (this.weapon) {
      this.weapon.tick();
    }

    this.playerHit = Math.max(this.playerHit - 1, 0);

    this.defending = false;

    // resolve parry ability
    if (!this.dead && !this.canParry) {
      this.canParry = (this.game.turnCount - this.weapon.lastParryTurn) >= this.weapon.parryFrequency;
      this.isPlayer && this.canParry && this.parry && this.game.hud.writeMessage('You are ready to parry attacks!');
    }
  }

  act() {
    let moved = false;
    // seek player by default
    if (!this.asleep && !this.stunned && !this.isPlayer) {
      let seekTiles = this.map.getAdjacentNeighbors(this.tile).filter(t => t?.creature?.isPlayer || t.passable || this.ignoreWalls);
      if (seekTiles.length) {
        let seekSign = this.allowedAttack ? 1 : -1;
        seekTiles.sort((a,b) => {
          return seekSign * (this.map.dist(a, this.game.player.tile) - this.map.dist(b, this.game.player.tile));
        });
        let idx = 0;
        while (!moved && idx < seekTiles.length) {
          moved = this.tryMove(seekTiles[idx].x - this.tile.x, seekTiles[idx].y - this.tile.y);
          idx++;
        }
      }
    }
    return moved;
  }
}
