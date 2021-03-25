import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';
import weaponTypes from '../config/weaponTypes';

const factor = 0.75;
const baseDamage = Math.floor(weaponTypes[0].damage * factor );
const baseParry = Math.floor(weaponTypes[0].parry * factor);
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
