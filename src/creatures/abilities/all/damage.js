import { Ability } from '../ability';

const AMT = 1;

/**
 *
 * @param {import('../../../weapons/player').default} player
 */
const effectFn = player => {
  player.dmg += AMT;
};

class DamageAbility extends Ability {
  constructor() {
    super({
      name: 'Damage',
      description: `Deal +${AMT} damage`,
      cost: 16,
      effectFn
    });
  }

}

export const damage = new DamageAbility();
