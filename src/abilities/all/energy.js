import { Ability } from '../ability';

const AMT = 25;

/**
 *
 * @param {import("../../weapons/player").default} player
 */
const effectFn = player => {
  player.template.energy += AMT;
  player.energy += AMT;
};

export default class EnergyAbility extends Ability {
  constructor() {
    super({
      name: 'Energy',
      description: `Gain +${AMT} max energy`,
      cost: 0,
      effectFn
    });
  }
}
