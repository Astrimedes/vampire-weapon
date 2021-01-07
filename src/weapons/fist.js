import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';

export default class Fist extends Weapon {
  constructor(game, map, dmg = 4, parry = 0) {
    super(game, map, {
      spriteNumber: Sprite.Weapon.fist,
      reach: 1,
      parry: parry,
      damage: dmg,
      drawSprite: false
    }, false);
  }
}
