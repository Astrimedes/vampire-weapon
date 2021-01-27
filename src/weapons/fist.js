import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';
import weaponTypes from '../config/weaponTypes';

const baseDamage = weaponTypes[0].damage;

export default class Fist extends Weapon {
  constructor(game, map, dmg = baseDamage, parry = 2, options = {}) {
    super(game, map, {
      spriteNumber: Sprite.Weapon.fist,
      reach: 1,
      parry: parry,
      parryFrequency: 3,
      damage: dmg,
      drawSprite: false,
      ...options
    }, false);
  }
}
