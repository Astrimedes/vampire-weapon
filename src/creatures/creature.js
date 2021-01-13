import { lerp, easeOut, easeIn } from '../tools/mathutil.js';

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
     * @param {boolean} options.ignoreWalls
     * @param {number} options.strength
     * @param {number} options.agility
     * @param {number} options.resistance
     */
  constructor(game, map, tile, spriteNumber, hp, weapon, options = {}) {
    this.game = game;
    this.map = map;
    this.move(tile);
    this.spriteNumber = spriteNumber;
    this.hp = hp;
    this.maxHp = hp;

    // copy stats
    this.strength = options.strength || 0;
    this.agility = options.agility || 0;
    this.resistance = options.resistance || 0;

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

    this.stunned = 2; // stunned thru one player turn on spawn

    this.id = ID++;

    this.spawnTurn = this.game.turnCount;

    this.playerHit = false;

    // movement abilities
    this.ignoreWalls = options.ignoreWalls || false;
    this.isSmart = false;

    this.startTurn = this.game.turnCount;

    // parry normally controlled by weapon or defend action
    this.defending = false;
    this.canParry = false;

    this.name = this.constructor.name;

    // set player control level - adjusted in wield by player
    this.control = 0;

    this.wield(weapon);
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

  hit(dmg, attacker) {
    let parry = 0;
    if ((this?.weapon?.parry && this.canParry) || this.defending) {
      let weaponParry = Math.max(Math.floor((this.weapon.parry || 0) / 2), 1);
      parry = Math.min(dmg, this.defending ? weaponParry + Math.max(2, weaponParry / 2) : weaponParry);
      this.weapon.lastParryTurn = this.game.turnCount;
      this.canParry = false;
    }

    this.hp -= dmg - parry;
    this.dead = this.hp <= 0;

    this.playerKilled = attacker?.isPlayer || false;

    return parry;
  }

  die(silent = false) {
    this.stopAnimation();
    this.dieSilent = this.dieSilent || silent;
    if (!this.deathResolved) {
      this.stunned = 0;
      this.hp = 0;
      this.deathResolved = true;
      if (this.tile && this.tile.creature == this) this.tile.creature = null;
      this.tile = null;
      this.spriteNumber++; // corpse tile should be next tile...

      if (!(silent || this.dieSilent)) {
        let msg = this.isPlayer ? 'You die!' : `${this.name} is destroyed!`;
        this.game.hud.writeMessage(msg);
      }

      // destroy weapon
      this?.weapon?.die();
      this.unWield();
    }
  }

  beginAnimation(xTarget, yTarget, interp = (t) => easeOut(easeIn(t)), duration = 170) {
    this.animating = true;
    this.offsetX = this.x - xTarget;
    this.offsetY = this.y - yTarget;
    this.weapon.x = this.getDisplayX();
    this.weapon.y = this.getDisplayY();
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
   * @param {import('../weapons/weapon').default} weapon
   */
  wield(weapon) {
    if (this.weapon) {
      this.unWield(weapon);
    }
    this.weapon = weapon;

    weapon.setWielder(this);

    this.maxHp += weapon.maxHp;
    this.hp += weapon.maxHp;

    this.isPlayer = !!weapon.isPlayer;
    if (this.isPlayer) {
      this.stunned = 0; // reset stun
      this.allowedAttack = true; // player always allowed attack

      // set player control - scale from 0 to 100686
      this.control = 100;

      // remove self from monster list, assign to playerBody
      let idx = this.game.monsters.findIndex(m => m == this);
      if (idx !== -1) {
        this.game.monsters.splice(idx, 1);
      }
    }

    return true;
  }

  unWield() {
    this.isPlayer = false;
    if (!this.weapon) return;
    this.maxHp = Math.max(1, this.maxHp - (this.weapon.maxHp || 0));
    this.hp = Math.max(1, this.hp - (this.weapon.maxHp || 0));
    this.weapon = null;
  }

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

    if (this.tile) {
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
  }

  getDisplayX() {
    return this.x + this.offsetX;
  }

  getDisplayY() {
    return this.y + this.offsetY;
  }

  tryAct() {
    if (this.dead) return false;

    // die if necessary
    if (this.hp <= 0) {
      this.dead = true;
      return false;
    }

    let acted = false;

    // trigger act
    if (this.stunned <= 0) {
      this.act();
      acted = true;
    }

    if (this.tile) {
      this.tile.stepOn(this);
    }

    // otherwise finish without acting
    return acted;
  }

  tick() {
    // reduce status durations after first turn passes
    if (this.game.turnCount <= this.spawnTurn) {
      return;
    }
    this.stunned = Math.max(this.stunned - 1, 0);

    if (this.weapon) {
      this.weapon.tick();
    }

    // decrement player control
    if (this.control) {
      this.control -= this.resistance;
    }

    this.playerHit = Math.max(this.playerHit - 1, 0);

    this.defending = false;
  }

  act() {
    // seek player by default
    if (!this.stunned && !this.isPlayer) {
      let seekTiles = this.map.getAdjacentNeighbors(this.tile).filter(t => t?.creature?.isPlayer || t.passable || this.ignoreWalls);
      if (seekTiles.length) {
        let seekSign = this.allowedAttack ? 1 : -1;
        seekTiles.sort((a,b) => {
          return seekSign * (this.map.dist(a, this.game.player.tile) - this.map.dist(b, this.game.player.tile));
        });
        let moved = false;
        let idx = 0;
        while (!moved && idx < seekTiles.length) {
          moved = this.tryMove(seekTiles[idx].x - this.tile.x, seekTiles[idx].y - this.tile.y);
          idx++;
        }
        return moved;
      }
    }
  }

  createPlayerBody(player) {
    let playerBody = new this.constructor(this.game, this.map, this.tile);
    playerBody.wield(player);
    // set facing to match original body
    playerBody.lastMoveX = this.lastMoveX;
    playerBody.lastMoveY = this.lastMoveY;
    playerBody.isPlayer = true;
    return playerBody;
  }
}
