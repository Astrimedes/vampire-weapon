import { Ability } from '../ability';

const AMT = 1;

/**
 *
 * @param {import("../../weapons/player").default} player
 */
const effectFn = player => {
  player.maxHp = (player.maxHp || 0) + AMT;
  player.wielder.maxHp += AMT;
  player.wielder.hp += AMT;
};

export default class HealthAbility extends Ability {
  constructor() {
    super({
      name: 'Health',
      description: `All wielders +${AMT} health`,
      cost: 0,
      effectFn
    });
  }
}
