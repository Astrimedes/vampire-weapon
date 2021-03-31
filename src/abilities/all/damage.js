import { Ability } from '../ability';

const AMT = 1;

/**
 *
 * @param {import('../../../weapons/player').default} player
 */
const effectFn = player => {
  player.dmg += AMT;
};

export default class DamageAbility extends Ability {
  constructor() {
    super({
      name: 'Damage',
      description: `Deal +${AMT} damage`,
      cost: 5,
      effectFn
    });
  }
}
