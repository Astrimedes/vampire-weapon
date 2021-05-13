import Weapon from './weapon';
import weaponTypes from '../config/weaponTypes';

const BASE_DMG_IDX = 0; // SWORD
const BASE_PARRY_IDX = 0; // AXE

const factor = 1;
const baseDamage = Math.max(1, Math.floor(weaponTypes[BASE_DMG_IDX].damage * factor ));
const baseParry = Math.max(1, Math.floor(weaponTypes[BASE_PARRY_IDX].parry * factor));
const baseParryFreq = weaponTypes[0].parryFrequency;

export default class Fist extends Weapon {
  constructor(game, map, dmg = baseDamage, parry = baseParry, parryFreq = baseParryFreq, options = {}) {
    super(game, map, {
      spriteNumber: 0, // invisible
      reach: 1,
      parry: parry,
      parryFrequency: parryFreq,
      damage: dmg,
      drawSprite: false,
      ...options
    }, false);
  }
}
