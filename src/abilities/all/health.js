import { Ability } from '../ability';

const AMT = 1;

/**
 *
 * @param {import("../../weapons/player").default} player
 */
const effectFn = player => {
  player.maxHp = (player.maxHp || 0) + AMT;
  player.wielder.maxHp += AMT;
  player.wielder.hp = player.wielder.maxHp;
};

export default class HealthAbility extends Ability {
  constructor() {
    super({
      name: 'Health',
      description: `Heal 100%, gain +${AMT} max hp`,
      cost: 0,
      effectFn
    });
  }
}
