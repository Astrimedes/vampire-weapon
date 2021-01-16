import { Ability } from '../ability';

const HP = 2;
const TIMES = 3;

/**
 *
 * @param {import('../../../weapons/player').default} player
 */
const effectFn = player => {
  player.maxHp = (player.maxHp || 0) + HP;
  player.wielder.maxHp += HP;
  player.wielder.hp += HP;
};

const nextAbilityFn = () => {
  // this can be taken multiple times
  return this;
};

class HealthAbility extends Ability {
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

export const health = new HealthAbility();
