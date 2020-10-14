// eslint-disable-next-line no-unused-vars
import Dungeon from '../map/map.js';
// eslint-disable-next-line no-unused-vars
import { Tile } from '../map/tile.js';
// eslint-disable-next-line no-unused-vars
import Game from '../systems/game.js';
import { spike, lerp, easeOut, easeIn } from '../tools/mathutil.js';

export default class Creature {
  /**
     *
     * @param {Game} map
     * @param {Dungeon} map
     * @param {Tile} tile
     * @param {number} spriteNumber
     * @param {number} hp
     */
  constructor(game, map, tile, spriteNumber, hp) {
    this.game = game;
    this.map = map;
    this.move(tile);
    this.spriteNumber = spriteNumber;
    this.hp = hp;

    // set these after move to prevent any initial animation
    this.offsetX = 0;
    this.offsetY = 0;
    this.animating = false;
    this.animStart = null;
    this.animDuration = 0;

    this.dead = false;
    this.deathResolved = false;
    this.stunned = 1; // stunned for one turn on spawn
    this.angry = 0;
  }

  attack(creature, dx, dy) {
    creature.hit(1);
    this.animating = true;
    this.beginAnimation(this.x - (dx/2), this.y - (dy/2), t => spike(t));
  }

  tryMove(dx, dy) {
    let newTile = this.map.getNeighbor(this.tile, dx, dy);
    if (newTile.passable && !newTile.creature) {
      this.move(newTile);
      return true;
    } else if (newTile.creature && newTile.creature.isPlayer !== this.isPlayer) {
      this.attack(newTile.creature, dx, dy);
      return true;
    }
    // animation to bump against wrong direction...
    this.beginAnimation(this.x - (dx/4), this.y - (dy/4), t => spike(t));
    return false;
  }

  hit(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.dead = true;
    }
    // increase anim speed when attacked so they jump into position
    this.animSpeed *= 2;
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

  move(tile) {
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
  }

  getDisplayX() {
    return this.x + this.offsetX;
  }

  getDisplayY() {
    return this.y + this.offsetY;
  }

  tryAct() {
    if (this.stunned == 0) {
      this.act();
      return true;
    }
    this.stunned = Math.max(this.stunned - 1, 0);
    return false;
  }

  act() {
    // seek player by default
    let seekTiles = this.map.getAdjacentPassableNeighbors(this.tile);
    seekTiles = seekTiles.filter(tile => !tile.creature || tile.creature.isPlayer);
    if (seekTiles.length) {
      seekTiles.sort((a,b) => {
        return this.map.dist(a, this.game.player.tile) - this.map.dist(b, this.game.player.tile);
      });
      this.tryMove(seekTiles[0].x - this.x, seekTiles[0].y - this.y);
    }
  }
}
