import Special from '../special';
import {TargetType} from '../targetType';

const blinkSpecial = new Special({
  name: 'Blink',
  targetType: TargetType.Tile,
  useCost: 13,
  usesAction: true,
  range: 2,
  /**
   *
   * @param {import('../../creature').default} self
   * @param {import('../../../map/tile').Tile} tile
   */
  effectFn: (self, tile) => {
    if (tile.passable && !tile.creature) {
      // check distance
      let xDist = Math.abs(self.x - tile.x);
      let yDist = Math.abs(self.y - tile.y);
      if (xDist > blinkSpecial.range || yDist > blinkSpecial.range) return false;

      self.move(tile);
      let name = self.isPlayer ? 'You' : 'The ' + self.name;
      let verb = self.isPlayer ? 'teleport' : 'teleports';
      self.game.hud.writeMessage(`${name} ${verb}!`);
      return true;
    }
    return false;
  }
});

export { blinkSpecial };
