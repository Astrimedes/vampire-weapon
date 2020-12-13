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
  let ability = game.selectedAbility;
  if (!ability) return false;

  // raw distance
  const xDist = tile.x - game.player.x;
  const yDist = tile.y - game.player.y;
  if (xDist + yDist > (ability.range || 0)) return false;

  // TODO: apply effects based on game target ability
  if (ability == 0) {
    return true;
  }
  return false;
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

export const TargetInput = new InputType('target', tileCallback, commandCallback);
