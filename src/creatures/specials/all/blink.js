import Special from '../special';
import { TargetType } from '../targetType';

const COST = 1;

const blinkSpecial = new Special({
  name: 'Blink',
  targetType: TargetType.Tile,
  useCost: COST,
  usesAction: true,
  range: 3,
  /**
   *
   * @param {import('../../creature').default} self
   * @param {import('../../../map/tile').Tile} tile
   */
  effectFn: (self, tile) => {
    console.log(`Blink fn called: self: ${self}, tile: ${tile}`);
    if (tile.passable && !tile.creature) {
      // check distance
      if (self.game.map.diagDist(self.tile, tile) > blinkSpecial.range) return false;

      self.move(tile);
      let name = self.isPlayer ? 'You' : 'The ' + self.name;
      let verb = self.isPlayer ? 'teleport' : 'teleports';
      self.game.hud.writeMessage(`${name} ${verb}!`);

      // deduct blood cost
      if (self.isPlayer) {
        self.hp -= COST;
      }
      return true;
    }
    return false;
  }
});

export { blinkSpecial };
