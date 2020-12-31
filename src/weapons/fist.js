import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';

export default class Fist extends Weapon {
  constructor(game, map, dmg = 1) {
    super(game, map, Sprite.Weapon.fist, 1, dmg, false, 'brown');
  }
}
