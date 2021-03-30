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

        // pick up blood
        c.weapon.blood += i.blood;

        // heal - 25% of creature health
        // const heal = Math.min(c.maxHp - c.hp, Math.max(2, Math.floor((c.maxHp - c.weapon.maxHp) * 0.25)));
        const heal = i.blood;
        c.hp = Math.min(c.hp + heal, c.maxHp);

        // write
        let msgText = `Your wielder heals ${heal} damage.`;
        c.game.hud.writeMessage(msgText);
        return true;
      }
    });
    this.blood = bloodAmt || 0;
  }
}
