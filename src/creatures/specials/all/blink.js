import Special from '../special';
import {TargetType} from '../targetType';

const blinkSpecial = new Special({
  name: 'Blink',
  targetType: TargetType.Tile,
  /**
   *
   * @param {import('../../creature').default} self
   * @param {import('../../../map/tile').Tile} tile
   */
  effectFn: (self, tile) => {
    if (tile.passable && !tile.creature) {
      self.move(tile);
      return true;
    }
    return false;
  }
});

export { blinkSpecial };
