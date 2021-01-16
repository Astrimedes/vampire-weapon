import { blinkSpecial } from '../../specials/all/blink';
import { Ability } from '../ability';

const TIMES = 3;

/**
 *
 * @param {import('../../../weapons/player').default} player
 */
const effectFn = player => {
  if (!player.specials.includes(blinkSpecial)) {
    player.specials.push(blinkSpecial);
    if (player.wielder && !player.wielder.specials.includes(blinkSpecial)) {
      player.wielder.specials.push(blinkSpecial);
    }
  }
};

const nextAbilityFn = () => {
  // this can be taken multiple times
  return this;
};

class BlinkAbility extends Ability {
  constructor() {
    super({
      name: 'Blink',
      description: `Teleport ${TIMES} times`,
      cost: 24,
      effectFn,
      nextAbilityFn
    });
  }

}

export const blink = new BlinkAbility();
