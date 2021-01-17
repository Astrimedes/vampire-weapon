import { blinkSpecial } from '../../creatures/specials/all/blink';
import { Ability } from '../ability';

/**
 *
 * @param {import('../../../weapons/player').default} player
 */
const effectFn = player => {
  if (!player.specials.includes(blinkSpecial)) {
    player.specials.push(blinkSpecial);
    if (player.wielder && !player.wielder.specials.includes(blinkSpecial)) {
      player.wielder.specials.push(blinkSpecial);
      player.wielder.game.updateHud(true);
    }
  }
};

export default class BlinkAbility extends Ability {
  constructor() {
    super({
      name: 'Blink',
      description: 'Spend blood to teleport',
      cost: 32,
      oneTime: true,
      effectFn
    });
  }

}
