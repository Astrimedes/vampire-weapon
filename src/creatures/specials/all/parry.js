import Special from '../special';
import { TargetType } from '../targetType';

const COST = 15;

const parrySpecial = new Special({
  name: 'Parry',
  targetType: TargetType.Creature,
  useCost: COST,
  usesAction: true,
  range: 1,
  /**
   *
   * @param {import('../../creature').default} self
   * @param {import('../../creature').default} creature
   */
  effectFn: (self, creature) => {
    console.log(`Parry fn called: self: ${self}, target: ${creature}`);
    if (creature && (creature.isPlayer != self.isPlayer)) {
      // check distance
      if (self.game.map.diagDist(self.tile, creature.tile) > parrySpecial.range) return false;

      let name = self.isPlayer ? 'You' : 'The ' + self.name;
      let verb = self.isPlayer ? 'teleport' : 'teleports';
      self.game.hud.writeMessage(`${name} ${verb}!`);

      // deduct energy cost
      if (self.isPlayer) {
        self.weapon.energy -= COST;
      }
      return true;
    }
    return false;
  }
});

export { parrySpecial };
