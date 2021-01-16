import { Ability } from '../ability';

const AMT = 2;

/**
 *
 * @param {import('../../../weapons/player').default} player
 */
const effectFn = player => {
  player.maxHp = (player.maxHp || 0) + AMT;
  player.wielder.maxHp += AMT;
  player.wielder.hp += AMT;
};

const nextAbilityFn = () => {
  // this can be taken multiple times
  return this;
};

export default class HealthAbility extends Ability {
  constructor() {
    super({
      name: 'Health',
      description: `Grant wielders +${AMT} health`,
      cost: 7,
      effectFn,
      nextAbilityFn
    });
  }
}
