import { Ability } from '../ability';

const AMT = 2;

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
      description: `Parry blocks +${AMT/2} damage`,
      cost: 16,
      effectFn
    });
  }
}
