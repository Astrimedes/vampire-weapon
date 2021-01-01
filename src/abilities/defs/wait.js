import { Ability, TARGET_SELECT } from '../ability.js';

export const waitAbility = new Ability({
  name: 'Wait',
  description: 'Wait one turn',
  cost: 0,
  charges: 0,
  targetSelect: TARGET_SELECT.self,
  effectFn: (self) => {
    if (self.isPlayer) {
      self.game.wait();
    }
    return true;
  },
  usesTurn: true
});
