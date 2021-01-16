
import { TargetType } from './targetType';

export default class Special {
  /**
   *
   * @param {object} options
   * @param {string} options.name
   * @param {number} options.targetType
   * @param {selfEffect | creatureEffect | tileEffect} options.effectFn
   */
  constructor(options) {
    const { name, targetType, effectFn } = { ...options };
    if (!Object.values(TargetType).includes(targetType)) {
      throw 'Invalid targetType!';
    }
    this.name = name;
    this.targetType = targetType;
    this.effectFn = effectFn;
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
 * @param {import('../creature').default} self
 * @param {import('../creature').default} creature
 */

/**
 * Effect that targets a tile
 * @callback tileEffect
 * @param {import('../creature').default} self
 * @param {import('../../map/tile').Tile} tile
 */
