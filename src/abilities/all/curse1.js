import { Ability } from '../ability';

const AMT = 0.2;

/**
 *
 * @param {import('../../weapons/player').default} player
 */
const effectFn = player => {
  player.charmConfig.power += AMT;
};

export default class Curse1Ability extends Ability {
  constructor() {
    super({
      name: 'Curse Control',
      description: `Curse control power + ${AMT * 100}%`,
      cost: 5,
      effectFn
    });
  }
}
