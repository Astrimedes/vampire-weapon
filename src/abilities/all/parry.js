import { Ability } from '../ability';

const AMT = 1;

/**
 *
 * @param {import('../../weapons/player').default} player
 */
const effectFn = player => {
  player.parry += AMT;
};

export default class ParryAbility extends Ability {
  constructor() {
    super({
      name: 'Parry',
      description: 'Parry blocks damage and counter attacks',
      cost: 0,
      effectFn
    });
  }
}
