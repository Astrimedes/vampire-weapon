import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';
import weaponTypes from '../config/weaponTypes';

const BASE_DMG_IDX = 0; // SWORD
const factor = 0.75;
const baseDamage = Math.max(1, Math.floor(weaponTypes[BASE_DMG_IDX].damage * factor ));

export default class Bolt extends Weapon {
  constructor(game, map, dmg = baseDamage, parry = 0, parryFreq = 0, options = {}) {
    super(game, map, {
      spriteNumber: Sprite.Weapon.bolt,
      reach: 4,
      parry: parry,
      parryFrequency: parryFreq,
      damage: dmg,
      drawSprite: true,
      ...options
    }, false);
  }

  tryAct() {
    super.tryAct();
    this.drawSprite = this.attacking;
  }

  attack(target, dx, dy) {
    this.game.addSimpleParticles(48, this.tile.x, this.tile.y, {r: 244, g: 208, b: 63, a: 1}, true);
    super.attack(target, dx, dy);
  }
}
