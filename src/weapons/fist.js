import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';
import weaponTypes from '../config/weaponTypes';

const baseDamage = weaponTypes[0].damage;
const baseParry = weaponTypes[0].parry;
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
