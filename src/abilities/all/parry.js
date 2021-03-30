import { Ability } from '../ability';

const AMT = 4;

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
      cost: 4,
      effectFn
    });
  }
}
