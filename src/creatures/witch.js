import Creature from './creature.js';
import { Sprite } from '../../assets/sprite-index.js';
import Bolt from '../weapons/bolt.js';
import { Shop } from '../map/tile.js';

export default class Witch extends Creature {
  /**
   *
   * @param {import('../systems/game').default} game
   * @param {Dungeon} map
   * @param {Tile} tile
   */
  constructor(game, map, tile, weapon = new Bolt(game, map), options = {}) {
    super(game, map, tile, Sprite.Creature.witch, (game.level || 1) * 2, weapon, {
      ignoreWalls: false,
      noticeRange: 4,
      controlResist: 0.75,
      strength: 0,
      agility: 2,
      ...options
    });
  }

  act() {
    if (this.asleep || this.stunned || this.isPlayer) return;

    let path = this.findPathToPlayer(false);
    let playerTile = path[path.length - 1];

    let tryAttack= this.fear < 100 && path.length <= this.weapon.reach;
    if (!tryAttack && playerTile) {
      let alignedX = this.tile.x == playerTile.x;
      let alignedY = this.tile.y == playerTile.y;
      for (let i = 0; (alignedX || alignedY) && i < this.weapon.reach && i < path.length; i++) {
        let t = path[i];
        alignedX = alignedX && t.x == playerTile.x;
        alignedY = alignedY && t.y == playerTile.y;
      }
      tryAttack = (alignedX || alignedY);
    }

    // set here to force behavior
    this.allowedAttack = tryAttack;

    // now run the usual logic
    return super.act();
  }

  // act() {
  //   if (this.isPlayer || this.hp <= 0) return false;

  //   let map = this.game.map;
  //   // find path to player
  //   const path = map.findPath(this.tile, this.game.player.wielder.tile);

  //   // *** if player is too far, and this tile isnt' trapped, exit and 'wait' ***
  //   if (!this.tile.trapped && path.length > 5 && Rng.inFloatRange(0, 1) < 0.75) {
  //     return true;
  //   }

  //   let tile = path[0];
  //   // if player is 1 square away, try choosing a tile not towards him...
  //   return this.tryMove(tile.x - this.x, tile.y - this.y);
  // }

  die(silent) {
    if (!this.deathResolved) {
      let tile = this.tile;
      let game = this.game;

      // turn off visible corpse
      this.visible = false;
      super.die(silent);

      game.addSimpleParticles(24, tile.x, tile.y, { r: 50, g: 75, b: 150, a: 1 });
      game.map.replaceTile(tile, Shop);
    }

  }
}
