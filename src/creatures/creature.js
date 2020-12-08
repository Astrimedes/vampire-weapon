import { spike, lerp, easeOut, easeIn } from '../tools/mathutil.js';

let ID = 0;

export default class Creature {
  /**
     *
     * @param {Game} game
     * @param {Dungeon} map
     * @param {Tile} tile
     * @param {number} spriteNumber
     * @param {number} hp
     * @param {object} options - ex: {ignoreWalls: true}
     */
  constructor(game, map, tile, spriteNumber, hp, weapon, options = {}) {
    this.game = game;
    this.map = map;
    this.weapon = weapon;
    this.move(tile);
    this.spriteNumber = spriteNumber;
    this.hp = hp;

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

    this.fire = 0;
    this.ice = 0;
    this.bleed = 0;

    this.id = ID++;

    this.spawnTurn = this.game.turnCount;

    this.playerHit = false;

    // movement abilities
    this.ignoreWalls = options.ignoreWalls || false;
    this.isSmart = false;

    this.startTurn = this.game.turnCount;

    this.name = this.constructor.name;

    this.wield(weapon);
  }

  isStunned() {
    return this.stunned > 1 || this.isPlayer && this.stunned;
  }

  tryMove(dx, dy) {
    // first check movement - 1 square
    let newTile = this.map.getNeighbor(this.tile, dx, dy);
    let moveTile = (this.ignoreWalls || newTile.passable) && this.map.inBounds(newTile.x, newTile.y) && !newTile.creature ? newTile : null;
    if (moveTile && this.weapon.reach == 1) {
      this.move(moveTile);
      return true;
    }

    // attack adjacent
    if (newTile.creature && newTile.creature.isPlayer !== this.isPlayer) {
      this.weapon.attack(newTile.creature, dx, dy);
      this.lastMoveX = dx;
      this.lastMoveY = dy;
      return true;
    }

    // bump against wall and return
    if ((!this.ignoreWalls && !newTile.passable) && (!newTile.creature || newTile.creature.isPlayer === this.isPlayer)) {
      // animation to bump against wrong direction...
      this.beginAnimation(this.x - (dx / 4), this.y - (dy / 4), t => spike(t));
      return false;
    }

    if (this.weapon.reach < 2) {
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

    if (newTile.creature && (newTile.creature.isPlayer !== this.isPlayer)) {
      this.weapon.attack(newTile.creature, newTile.x - this.x, newTile.y - this.y);
      return true;
    }

    if (moveTile && !moveTile.creature) {
      this.move(moveTile);
      return true;
    }

    return false;
  }

  hit(dmg, effects) {
    this.hp -= dmg;
    effects.forEach(e => {
      switch (e.type) {
      case 'Fire':
        this.fire = (this.fire || 0) + e.value + 1;
        break;
      case 'Ice':
        this.ice = (this.ice || 0) + e.value + 1;
        break;
      case 'Bleed':
        this.bleed = (this.bleed || 0) + e.value + 1;
        break;
      case 'Player':
        this.playerHit = true;
        break;
      default:
        throw e.type;
      }
    });
    this.dead = this.hp <= 0;
  }

  die(silent = false) {
    this.stopAnimation();
    this.dieSilent = this.dieSilent || silent;
    if (!this.deathResolved) {
      this.stunned = 0;
      this.fire = 0;
      this.ice = 0;
      this.bleed = 0;
      this.hp = 0;
      this.deathResolved = true;
      if (this.tile) this.tile.creature = null;
      this.tile = null;
      this.spriteNumber++; // corpse tile should be next tile...

      if (!(silent || this.dieSilent)) {
        let msg = this.isPlayer ? 'You die!' : `${this.name}'s will is destroyed!`;
        this.game.hud.writeMessage(msg);
      }

      // destroy weapon
      this?.weapon?.die();
      this.unWield();
    }
  }

  beginAnimation(xTarget, yTarget, interp = (t) => easeOut(easeIn(t)), duration = 150) {
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
    let fraction = Math.max(0, Math.min(animTime / this.animDuration, 1));
    this.offsetX =  lerp(this.offsetX, 0, this.animInterp(fraction));
    this.offsetY = lerp(this.offsetY, 0, this.animInterp(fraction));

    this.weapon.x = this.getDisplayX();
    this.weapon.y = this.getDisplayY();

    let min = 0.005;

    if (Math.abs(this.offsetX) + Math.abs(this.offsetY) < min) {
      this.stopAnimation();
    }
    return true;
  }

  wield(weapon) {
    this.weapon = weapon;

    weapon.setWielder(this);

    this.isPlayer = !!weapon.isPlayer;
    if (this.isPlayer) {
      this.stunned = 0; // reset stun
      this.allowedAttack = true; // player always allowed attack
    }

    // remove self from monster list, assign to playerBody
    let idx = this.game.monsters.findIndex(m => m == this);
    if (idx !== -1) {
      this.game.monsters.splice(idx, 1);
    }

    return true;
  }

  unWield() {
    this.weapon = null;
    this.isPlayer = false;
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

    tile.stepOn(this);

    this.tile = tile;
    tile.creature = this;
    // set x & y from tile
    this.x = tile.x;
    this.y = tile.y;

    this.weapon.tile = tile;
  }

  getDisplayX() {
    return this.x + this.offsetX;
  }

  getDisplayY() {
    return this.y + this.offsetY;
  }

  tryAct() {
    if (this.dead) return false;

    // apply effects from statuses
    // stunning
    if (this.ice) {
      this.stunned += 1 + Math.floor((this.ice-1) / 2);
    }
    // damage
    if (this.fire > 0) {
      this.hp -= this.fire;
    }
    // bleed
    if (this.bleed && (this.bleed % 3 == 0)) {
      this.hp -= 1;
      this.bleed--;
    }

    // die if necessary
    if (this.hp <= 0) {
      this.dead = true;
      return false;
    }

    // trigger act
    if (this.stunned <= 0) {
      this.act();
      return true;
    }

    // otherwise finish without acting
    return false;
  }

  tick() {
    // reduce status durations after first turn passes
    if (this.game.turnCount <= this.spawnTurn) {
      return;
    }
    this.stunned = Math.max(this.stunned - 1, 0);
    this.fire = Math.max(this.fire - 1, 0);
    this.ice = Math.max(this.ice - 1, 0);
    this.bleed = Math.max(this.bleed - 1, 0);

    if (this.weapon) {
      this.weapon.tick();
    }

    // give player blood while bleeding
    if (this.bleed && !this.isPlayer) {
      this.game.player.blood += this.bleed;
    }

    this.playerHit = Math.max(this.playerHit - 1, 0);
  }

  act() {
    if (this.stunned) return true;

    // player controls behavior
    if (this.isPlayer) return false;

    // seek player by default
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

  createPlayerBody(player) {
    let playerBody = new this.constructor(this.game, this.map, this.tile, player);
    // set facing to match original body
    playerBody.lastMoveX = this.lastMoveX;
    playerBody.lastMoveY = this.lastMoveY;
    return playerBody;
  }
}
