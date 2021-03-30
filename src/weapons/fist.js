import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';
import weaponTypes from '../config/weaponTypes';

const factor = 0.75;
const baseDamage = Math.max(1, Math.floor(weaponTypes[0].damage * factor ) - 1);
const baseParry = Math.max(1, Math.floor(weaponTypes[0].parry * factor) - 1);
const baseParryFreq = weaponTypes[0].parryFrequency;

export default class Fist extends Weapon {
  constructor(game, map, dmg = baseDamage, parry = baseParry, parryFreq = baseParryFreq, options = {}) {
    super(game, map, {
      spriteNumber: Sprite.Weapon.fist,
      reach: 1,
      parry: parry,
      parryFrequency: parryFreq,
      damage: dmg,
      drawSprite: false,
      ...options
    }, false);
  }
}
