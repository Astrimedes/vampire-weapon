import Item from '../item';
import {Sprite} from '../../../assets/sprite-index';

export default class BloodItem extends Item {
  /**
   *
   * @param {number} bloodAmt
   */
  constructor(bloodAmt) {
    super({
      name: 'blood',
      spriteNumber: Sprite.Item.blood,
      effectFn: (i, c) => {
        if (!c?.weapon?.isPlayer) return false;
        c.weapon.blood += i.blood;
        c.game.hud.writeMessage(`You collect ${i.blood} blood.`);
        return true;
      }
    });
    this.blood = bloodAmt || 0;
  }
}
