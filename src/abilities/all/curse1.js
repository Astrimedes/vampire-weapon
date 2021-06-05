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
      name: 'Charm Power',
      description: `Charm ${AMT * 100}% more powerful`,
      cost: 0,
      effectFn
    });
  }
}
