import { Sprite } from '../../assets/sprite-index';
import Weapon from './weapon';

export default class Fist extends Weapon {
  constructor(game, map) {
    super(game, map, Sprite.Weapon.fist, 1, false, 'brown');
  }
}
