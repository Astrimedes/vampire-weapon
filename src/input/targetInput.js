import { getActionDirection } from '../systems/inputReader';
import { InputType } from './inputstate';

/**
 * @typedef {import('../systems/game').default} Game
 */

/**
 *
 * @param {Game} game
 * @param {{x: number, y: number}} tile
 */

const tileCallback = (game, tile) => {
  let effectFn = game.inputTile;
  if (!effectFn) return false;

  // TODO: apply effects based on game target ability
  let result = effectFn(game, tile);
  return !!result;
};

/**
 *
 * @param {Game} game
 * @param {number} command
 */
const commandCallback = (game, command) => {
  const tile = game?.player?.tile;
  if (!tile) return false;

  // directional
  let dir = getActionDirection(command);
  if (!dir || (dir.x == 0 && dir.y == 0))
    return false;

  const targetTile = game.map.getTile(tile.x + dir.x, tile.y + dir.y);
  if (!targetTile)
    return false;

  return tileCallback(game, targetTile);
};

export const targetInput = new InputType('target', tileCallback, commandCallback);
