import { Ability } from '../ability';

const AMT = 3;

/**
 *
 * @param {import('../../weapons/player').default} player
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

class HealthAbility extends Ability {
  constructor() {
    super({
      name: 'health',
      description: 'Grant wielders additional health',
      cost: 9,
      effectFn,
      nextAbilityFn
    });
  }

}

export const health = new HealthAbility();
