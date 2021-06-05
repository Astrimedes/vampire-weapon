
import { InputStates } from '../../systems/gamestate';
import { TargetType } from './targetType';

export default class Special {
  /**
   *
   * @param {object} options
   * @param {string} options.name
   * @param {number} options.targetType specify TargetType.Tile to use TargetType.tileEffect effectFn
   * @param {function(import('../creature').default, import('../creature').default | import('../../map/tile').Tile, ):boolean} options.effectFn
   * @param {boolean} options.usesAction whether it uses a turn
   * @param {number} options.useCost energy cost to use
   * @param {number} options.range range in tiles if applicable
   */
  constructor(options) {
    const { name, targetType, effectFn, usesAction, useCost, range } = { ...options };
    if (!Object.values(TargetType).includes(targetType)) {
      throw 'Invalid targetType!';
    }
    this.name = name;
    this.targetType = targetType;
    this.effectFn = effectFn;
    this.useCost = useCost || 0;

    this.range = range;
    // if range is fn...
    if (typeof (range) == 'function') {
      this.range = 0;
      // wait until we calculate range the first time
    }

    this.usesAction = usesAction !== undefined ? !!usesAction : true;

    // Created action ready for assigning to inputTile action in Game
    if (targetType == TargetType.Tile) {
      /**
       *
       * @param {import('../../systems/game').default} game
       * @param {import('../../map/tile').Tile} tile
       */
      this.tileInputAction = (game, tile) => {
        let success = effectFn(game?.player?.wielder, tile);
        if (success) {
          game.setInputState(InputStates.Move);
          game.resetInputActions();
          if (this.usesAction) game.tick();
        } else {
          game.callMessageDialog('That didn\'t work.');
        }
      };
    }
  }

  /**
   *
   * @param {import('../creature').default} self
   * @param {import('../creature').default | import('../../map/tile').Tile} target
   */
  use(self, target) {
    this.effectFn(self, target);
  }


}

/**
 * Effect that targets self only
 * @callback selfEffect
 * @param {import('../creature').default} self
 */

/**
 * Effect that targets a creature
 * @callback creatureEffect
 * @param {} self
 * @param {import('../creature').default} creature
 */

/**
 * Effect that targets a tile
 * @callback tileEffect
 * @param {import('../creature').default} self
 * @param {import('../../map/tile').Tile} tile
 */
