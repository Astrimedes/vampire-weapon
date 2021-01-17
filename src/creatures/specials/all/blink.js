import Special from '../special';
import {TargetType} from '../targetType';

const blinkSpecial = new Special({
  name: 'Blink',
  targetType: TargetType.Tile,
  useCost: 13,
  usesAction: true,
  /**
   *
   * @param {import('../../creature').default} self
   * @param {import('../../../map/tile').Tile} tile
   */
  effectFn: (self, tile) => {
    if (tile.passable && !tile.creature) {
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
