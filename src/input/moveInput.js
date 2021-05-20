import { Actions, getActionDirection } from '../systems/inputReader';
import { InputType } from './inputstate';

/**
 * @typedef {import('../systems/game').default} Game
 */
/**
 *
 * @param {Game} game
 * @param {{x: number, y: number}} tile
 */

const moveTileCallback = (game, tile) => {
  let playerTile = game.player.wielder.tile;
  if (!playerTile) return;
  let path = game.map.findPath(playerTile, game.map.getTile(tile.x, tile.y), game.map.getCreatureTileCostFn(game.player.wielder));
  let x = (path?.length ? path[0].x : tile.x) - playerTile.x;
  let y = (path?.length ? path[0].y : tile.y) - playerTile.y;
  if (x && y) {
    x = Math.abs(x) > Math.abs(y) ? x : 0;
    y = x ? 0 : y;
  }
  // finally move
  if (game.player.tryMove(Math.sign(x), Math.sign(y))) {
    return game.tick();
  }

  return false;
};
/**
 *
 * @param {Game} game
 * @param {number} command
 */

const moveCommandCallback = (game, command) => {
  const tile = game?.player?.wielder?.tile;
  if (!tile) return false;

  // wait input command
  if (command == Actions.ok)
    return game.wait();

  // directional
  let dir = getActionDirection(command);
  if (!dir || (dir.x == 0 && dir.y == 0))
    return false;

  const targetTile = game.map.getTile(tile.x + dir.x, tile.y + dir.y);
  if (!targetTile)
    return false;

  return moveTileCallback(game, targetTile);
};

export const moveInput = new InputType('move', moveTileCallback, moveCommandCallback);
